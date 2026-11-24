#!/usr/bin/env node
// MCP 코드 모드 실행기.
// 도구 설명서 전체를 대화에 싣지 않고, 필요한 도구만 코드로 불러 결과만 돌려준다.
//
// CLI
//   node mcp.mjs servers                       설정된 서버 이름
//   node mcp.mjs tools <server>                도구 이름과 설명 첫 줄
//   node mcp.mjs schema <server> <tool>        도구 하나의 입력 스키마
//   node mcp.mjs call <server> <tool> [json]   호출하고 텍스트 결과만 출력 (--max N 으로 자르기)
//
// 스크립트에서
//   import { withServer } from "<이 파일 경로>";
//   const out = await withServer("context7", (c) => c.callTool({ name, arguments }));
//
// 서버 설정은 ~/.claude/mcp-codemode.json(코드 전용, 대화 도구 목록에 안 실림), ~/.claude.json 의 mcpServers,
// 현재 폴더 프로젝트의 mcpServers, ./.mcp.json 순으로 읽고 뒤쪽이 덮는다.
// claude.ai 커넥터와 플러그인 MCP는 OAuth가 대화 쪽에 있어 여기서 부를 수 없다.

import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport, getDefaultEnvironment } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

function readJson(path) {
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {};
}

export function loadServers(cwd = process.cwd()) {
  const user = readJson(join(homedir(), ".claude.json"));
  const project = user.projects?.[resolve(cwd)]?.mcpServers ?? {};
  const local = readJson(join(cwd, ".mcp.json")).mcpServers ?? {};
  const codeOnly = readJson(join(homedir(), ".claude", "mcp-codemode.json")).mcpServers ?? {};
  return { ...codeOnly, ...(user.mcpServers ?? {}), ...project, ...local };
}

function expand(value) {
  if (typeof value === "string") {
    return value.replace(/\$\{([A-Z0-9_]+)(?::-([^}]*))?\}/gi, (_, k, d) => process.env[k] ?? d ?? "");
  }
  if (Array.isArray(value)) return value.map(expand);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, expand(v)]));
  }
  return value;
}

function makeTransport(raw) {
  const cfg = expand(raw);
  const type = cfg.type ?? (cfg.url ? "http" : "stdio");
  if (type === "stdio") {
    return new StdioClientTransport({
      command: cfg.command,
      args: cfg.args ?? [],
      // 셸 전체 환경 대신 SDK 기본(PATH·HOME 등)과 서버 설정의 env만 넘긴다.
      env: { ...getDefaultEnvironment(), ...(cfg.env ?? {}) },
      stderr: "ignore",
    });
  }
  if (type !== "http" && type !== "sse") throw new Error(`지원하지 않는 서버 type: ${type}`);
  const opts = { requestInit: { headers: cfg.headers ?? {} } };
  return type === "sse"
    ? new SSEClientTransport(new URL(cfg.url), opts)
    : new StreamableHTTPClientTransport(new URL(cfg.url), opts);
}

export async function withServer(name, fn, cwd) {
  const servers = loadServers(cwd);
  if (!servers[name]) {
    throw new Error(`서버 '${name}' 없음. 설정된 서버: ${Object.keys(servers).join(", ") || "(없음)"}`);
  }
  const client = new Client({ name: "mcp-codemode", version: "1.0.0" });
  const transport = makeTransport(servers[name]);
  try {
    await client.connect(transport);
    return await fn(client);
  } finally {
    await client.close();
  }
}

export function textOf(result) {
  return (result.content ?? [])
    .map((c) => (c.type === "text" ? c.text : `[${c.type}]`))
    .join("\n");
}

async function main(argv) {
  const maxIdx = argv.indexOf("--max");
  const max = maxIdx >= 0 ? Number(argv.splice(maxIdx, 2)[1]) : 0;
  const [cmd, server, tool, json] = argv;
  const clip = (s) => (max > 0 && s.length > max ? `${s.slice(0, max)}\n…(${s.length - max}자 생략)` : s);

  switch (cmd) {
    case "servers":
      console.log(Object.keys(loadServers()).join("\n"));
      return;
    case "tools": {
      const { tools } = await withServer(server, (c) => c.listTools());
      for (const t of tools) console.log(`${t.name}\t${(t.description ?? "").split("\n")[0].slice(0, 120)}`);
      return;
    }
    case "schema": {
      const { tools } = await withServer(server, (c) => c.listTools());
      const t = tools.find((x) => x.name === tool);
      if (!t) throw new Error(`도구 '${tool}' 없음`);
      console.log(JSON.stringify(t.inputSchema, null, 2));
      return;
    }
    case "call": {
      const args = json ? JSON.parse(json) : {};
      const result = await withServer(server, (c) => c.callTool({ name: tool, arguments: args }));
      console.log(clip(textOf(result)));
      if (result.isError) process.exitCode = 1;
      return;
    }
    default:
      console.log("사용법: mcp.mjs servers | tools <server> | schema <server> <tool> | call <server> <tool> [json] [--max N]");
      process.exitCode = cmd ? 1 : 0;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main(process.argv.slice(2)).catch((e) => {
    console.error(`오류: ${e.message}`);
    process.exit(1);
  });
}
