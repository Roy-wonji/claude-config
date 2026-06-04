#!/usr/bin/env bash
# PostToolUse Write|Edit — 파일 확장자별 자동 포맷
file=$(jq -r '.tool_response.filePath // .tool_input.file_path // empty')
[ -z "$file" ] && exit 0
[ ! -f "$file" ] && exit 0

case "$file" in
  *.swift)
    command -v swiftformat >/dev/null 2>&1 && swiftformat --quiet "$file" >/dev/null 2>&1
    ;;
  *.ts|*.tsx|*.js|*.jsx|*.json|*.md|*.css|*.scss|*.html|*.yml|*.yaml)
    if command -v prettier >/dev/null 2>&1; then
      prettier --write --log-level=silent "$file" >/dev/null 2>&1
    elif command -v npx >/dev/null 2>&1; then
      npx --no-install prettier --write --log-level=silent "$file" >/dev/null 2>&1
    fi
    ;;
  *.py)
    command -v black >/dev/null 2>&1 && black -q "$file" >/dev/null 2>&1
    ;;
esac
exit 0
