#!/usr/bin/env bash
# PreToolUse Bash — git push 전 사용자 확인 요청
cmd=$(jq -r '.tool_input.command // empty')
if echo "$cmd" | grep -qE '(^|[;&|[:space:]])git[[:space:]]+push([[:space:]]|$)'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason: "git push 전 사용자 확인 필요. 코드 리뷰가 끝났는지, 푸시할 브랜치가 맞는지 확인하세요."
    }
  }'
fi
exit 0
