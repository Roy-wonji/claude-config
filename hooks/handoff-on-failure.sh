#!/usr/bin/env bash
# PostToolUseFailure — 도구 실패 시 .omc/handoff.md 누적
payload=$(cat)
tool=$(echo "$payload" | jq -r '.tool_name // empty')
[ -z "$tool" ] && exit 0

input=$(echo "$payload" | jq -r '.tool_input // {} | tostring' | head -c 1000)
err=$(echo "$payload" | jq -r '(.tool_response.error // .tool_response.content // .error // empty) | tostring' | head -c 2000)
[ -z "$err" ] && exit 0

cwd=$(pwd)
[ ! -d "$cwd/.git" ] && [ ! -f "$cwd/Package.swift" ] && [ ! -f "$cwd/package.json" ] && exit 0

mkdir -p "$cwd/.omc"
ts=$(date "+%Y-%m-%d %H:%M:%S")
{
  echo ""
  echo "## $ts — $tool failure"
  echo ""
  echo "**Input:**"
  echo '```json'
  echo "$input"
  echo '```'
  echo ""
  echo "**Error:**"
  echo '```'
  echo "$err"
  echo '```'
  echo ""
} >> "$cwd/.omc/handoff.md"

jq -n '{
  hookSpecificOutput: {
    hookEventName: "PostToolUseFailure",
    additionalContext: "[Harness] 도구 실패가 .omc/handoff.md에 기록됨. 동일 시도 반복하지 말고 가설을 바꾸세요."
  }
}'
exit 0
