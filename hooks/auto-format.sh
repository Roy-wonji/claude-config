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
    # 린트 자동수정 (js/ts 한정, 로컬 설치 시에만)
    case "$file" in
      *.ts|*.tsx|*.js|*.jsx)
        if command -v eslint >/dev/null 2>&1; then
          eslint --fix "$file" >/dev/null 2>&1
        elif command -v npx >/dev/null 2>&1; then
          npx --no-install eslint --fix "$file" >/dev/null 2>&1
        fi
        ;;
    esac
    ;;
  *.py)
    command -v black >/dev/null 2>&1 && black -q "$file" >/dev/null 2>&1
    ;;
esac
exit 0
