#!/usr/bin/env bash
# spec-kit 스캐폴드를 현재 프로젝트에 설치한다.
# roy 플러그인에 vendoring 된 spec-kit/ 을 ./.specify/ 로 복사한다.
set -euo pipefail

SRC="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}/spec-kit"
DST="$(pwd)/.specify"

if [[ ! -d "$SRC" ]]; then
  echo "ERROR: spec-kit 자산을 찾을 수 없음: $SRC" >&2
  exit 1
fi

if [[ -d "$DST" ]] && [[ "${1:-}" != "--force" ]]; then
  echo "이미 존재함: $DST (덮어쓰려면 --force)"
  exit 0
fi

mkdir -p "$DST"
cp -R "$SRC"/. "$DST"/
chmod +x "$DST"/scripts/bash/*.sh
echo "설치 완료: $DST"
