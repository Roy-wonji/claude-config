#!/usr/bin/env bash
# Stop 훅 — 작업 완료 알림 (데스크톱 항상 + Slack은 env 설정 시에만)
# Slack 활성화: shell 프로필에 export CLAUDE_NOTIFY_SLACK_WEBHOOK="https://hooks.slack.com/services/..."
#  (공개 레포에 시크릿을 커밋하지 않으려고 settings.json엔 URL을 넣지 않음)
cat >/dev/null 2>&1  # stdin(JSON) 소비

proj=$(basename "$PWD" 2>/dev/null)
title="Claude Code ✅"
msg="작업 완료 — ${proj}"

# 데스크톱 알림 (macOS)
if command -v osascript >/dev/null 2>&1; then
  osascript -e "display notification \"${msg}\" with title \"${title}\" sound name \"Glass\"" >/dev/null 2>&1
fi

# Slack 알림 (웹훅 env 설정 시에만)
hook="${CLAUDE_NOTIFY_SLACK_WEBHOOK:-}"
if [ -n "$hook" ]; then
  curl -s -m 5 -X POST -H "Content-Type: application/json" \
    -d "{\"text\":\"✅ Claude Code 작업 완료 — ${proj}\"}" "$hook" >/dev/null 2>&1 || true
fi

exit 0
