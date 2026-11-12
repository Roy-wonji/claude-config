#!/bin/bash
# 로컬 ~/.claude/skills 변경을 claude-config repo 로 동기화.
# - repo 에 이미 있는 스킬만 in-place 업데이트(큐레이션 보존)
# - 깨진 symlink/빈 폴더 건너뜀, .env/node_modules/dist 제외(시크릿 방지)
# - 변경 있을 때만 commit + push
set -uo pipefail

SRC="$HOME/.claude/skills"
REPO="$HOME/.claude/claude-config"
DST="$REPO/skills"

[ -d "$REPO/.git" ] || exit 0
cd "$REPO" || exit 0

git pull --quiet --rebase origin main 2>/dev/null || true

for dir in "$DST"/*/; do
  name=$(basename "$dir")
  src="$SRC/$name"
  [ -e "$src" ] || continue                      # 깨진 symlink/없음 skip
  [ -n "$(ls -A "$src" 2>/dev/null)" ] || continue  # 빈 폴더 skip
  rsync -aL --delete \
    --exclude '.git' --exclude '.env' --exclude '.env.*' \
    --exclude 'node_modules' --exclude '.DS_Store' --exclude 'dist' \
    "$src/" "$dir" 2>/dev/null || true
done

if [ -n "$(git status --porcelain skills/)" ]; then
  git add skills/
  git commit -q -m "chore: 로컬 스킬 자동 동기화 ($(date '+%Y-%m-%d %H:%M'))" 2>/dev/null || exit 0
  git push -q origin HEAD 2>/dev/null || true
fi
