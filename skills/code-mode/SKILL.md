---
name: code-mode
description: MCP를 기본적으로 대화에서 직접 부르지 않고 코드(스크립트)로 불러 필요한 결과만 받는 방식. 짧은 결과 1회 호출과 OAuth가 대화 쪽에만 있는 커넥터만 직접 부른다. "코드 모드", "code mode", MCP 호출 전반에서 쓴다.
---

# code-mode

도구 설명서 전체와 중간 결과를 컨텍스트에 싣지 않는다. 코드가 도구를 부르고, 거르고, **필요한 결과만** 돌려준다.
(Cloudflare Code Mode, Anthropic "Code execution with MCP"의 방식)

실행기: `${CLAUDE_PLUGIN_ROOT}/scripts/mcp-codemode/mcp.mjs`
(플러그인 경로를 모르면 `~/.claude/plugins/marketplaces/roy/scripts/mcp-codemode/mcp.mjs`)
처음 한 번은 그 폴더에서 `npm install`을 실행한다.

## 언제 쓰나

| 상황                                                   | 방식                                 |
| ------------------------------------------------------ | ------------------------------------ |
| MCP 호출 1번, 결과가 짧음                              | 직접 도구 호출                       |
| 같은/다른 MCP를 2번 이상 부름                          | 코드 모드                            |
| 결과가 길어 일부만 필요(목록·검색·문서)                | 코드 모드 + 거르기                   |
| 여러 결과를 비교·합치기                                | 코드 모드 스크립트 하나              |
| claude.ai 커넥터·플러그인 MCP(Figma, Notion, Tuist 등) | 직접 호출 (OAuth가 대화 쪽에만 있음) |

## 순서

1. 서버와 도구 찾기: 설명서를 통째로 읽지 않는다.
   ```bash
   node "$M" servers
   node "$M" tools <server>            # 이름 + 설명 첫 줄만
   node "$M" schema <server> <tool>    # 쓸 도구 하나만
   ```
2. 한 번 호출이면 CLI로 받는다. 길면 `--max`로 자른다.
   ```bash
   node "$M" call context7 resolve-library-id '{"libraryName":"tca","query":"reducer"}' --max 800
   ```
3. 여러 번이면 스크립트를 스크래치패드에 쓰고 결과만 출력한다.
   ```js
   import { withServer, textOf } from "<실행기 경로>/mcp.mjs";
   const ids = await withServer("context7", async (c) => {
     const libs = ["swift-composable-architecture", "swift-dependencies"];
     const out = [];
     for (const name of libs) {
       const r = await c.callTool({
         name: "resolve-library-id",
         arguments: { libraryName: name, query: name },
       });
       out.push(textOf(r).match(/library ID: (\S+)/)?.[1]);
     }
     return out;
   });
   console.log(ids.join("\n")); // 필요한 것만 출력
   ```
4. 비밀 값(토큰·키)은 출력하지 않는다. 결과에 섞이면 코드에서 지운다.

## 서버 배치

- 자주 직접 부르는 서버만 `~/.claude.json`의 `mcpServers`에 둔다(대화 도구 목록에 실림).
- 코드로만 부르는 서버는 `~/.claude/mcp-codemode.json`의 `mcpServers`로 옮긴다. 형식은 `.mcp.json`과 같다. 대화 도구 목록에서 빠져 컨텍스트가 줄고, 실행기로는 계속 부를 수 있다.
- 30일 동안 안 쓴 서버·플러그인 MCP는 사용자 승인을 받아 끈다. 사용 횟수는 다음으로 센다.
  ```bash
  find ~/.claude/projects -name "*.jsonl" -mtime -30 -print0 | xargs -0 grep -ohE '"name":"mcp__[a-zA-Z0-9_-]+' \
    | sed -E 's/"name":"mcp__//; s/__.*//' | sort | uniq -c | sort -rn
  ```
