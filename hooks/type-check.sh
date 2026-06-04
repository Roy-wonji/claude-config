#!/usr/bin/env bash
# PostToolUse Write|Edit — TS/TSX 타입 체크 (실패 시 Claude에게 피드백)
file=$(jq -r '.tool_response.filePath // .tool_input.file_path // empty')
[ -z "$file" ] && exit 0
[ ! -f "$file" ] && exit 0

case "$file" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac

dir="$(dirname "$file")"
tsconfig=""
while [ "$dir" != "/" ] && [ "$dir" != "." ]; do
  if [ -f "$dir/tsconfig.json" ]; then
    tsconfig="$dir/tsconfig.json"
    break
  fi
  dir="$(dirname "$dir")"
done
[ -z "$tsconfig" ] && exit 0

command -v tsc >/dev/null 2>&1 || exit 0

out=$(cd "$(dirname "$tsconfig")" && timeout 30 tsc --noEmit -p tsconfig.json 2>&1)
rc=$?
if [ $rc -ne 0 ] && [ $rc -ne 124 ]; then
  truncated=$(echo "$out" | head -50)
  jq -n --arg out "$truncated" '{
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: ("타입 체크 실패 (tsc --noEmit):\n" + $out + "\n\n타입 오류를 먼저 해결하세요.")
    }
  }'
fi
exit 0
