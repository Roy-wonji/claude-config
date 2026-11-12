#!/usr/bin/env bash
# PreToolUse Bash — 위험 명령 차단/확인
cmd=$(jq -r '.tool_input.command // empty')

deny_reason=""
ask_reason=""

if echo "$cmd" | grep -qE '(^|[[:space:]])sudo[[:space:]]+rm'; then
  deny_reason="sudo rm (시스템 파일 삭제 위험)"
elif echo "$cmd" | grep -qE 'chmod[[:space:]]+(-R[[:space:]]+)?777'; then
  deny_reason="chmod 777 (보안 취약)"
elif echo "$cmd" | grep -qE '(^|[[:space:]])dd[[:space:]]+if='; then
  deny_reason="dd if= (저수준 디스크 쓰기)"
elif echo "$cmd" | grep -qE ':\(\)\{[[:space:]]*:\|:&'; then
  deny_reason="포크 폭탄 패턴"
elif echo "$cmd" | grep -qE '(^|[[:space:]])rm[[:space:]]+(-[a-zA-Z]*[rRf][a-zA-Z]*[[:space:]]+)?(/|\$HOME|~)([[:space:]]|$)'; then
  deny_reason="rm 루트/홈 직접 삭제"
elif echo "$cmd" | grep -qE '(^|[[:space:]])rm[[:space:]]+-[a-zA-Z]*[rRf]'; then
  ask_reason="rm 재귀/강제 삭제"
elif echo "$cmd" | grep -qE 'git[[:space:]]+reset[[:space:]]+--hard'; then
  ask_reason="git reset --hard (작업 손실 위험)"
elif echo "$cmd" | grep -qE 'git[[:space:]]+push[[:space:]].*(-f([[:space:]]|$)|--force)'; then
  ask_reason="git push --force (원격 히스토리 덮어쓰기)"
elif echo "$cmd" | grep -qE '(^|[[:space:]])(git[[:space:]]+(checkout|restore)[[:space:]]+\.|git[[:space:]]+clean[[:space:]]+-[a-zA-Z]*f)'; then
  ask_reason="작업 디렉토리 강제 정리"
fi

if [ -n "$deny_reason" ]; then
  jq -n --arg r "$deny_reason" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: ("차단됨: " + $r + ". 사용자가 직접 실행하세요.")
    }
  }'
elif [ -n "$ask_reason" ]; then
  jq -n --arg r "$ask_reason" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason: ("확인 필요: " + $r)
    }
  }'
fi
exit 0
