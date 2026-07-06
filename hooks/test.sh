#!/usr/bin/env bash
# Stop — 테스트 실행 (비차단, 레지스트리 기반). 변경된 대상 파일이 있을 때만 돈다.
# - 진행중: hooks.json 의 statusMessage(스피너)로 표시
# - 성공: systemMessage 로 사용자에게 통과 알림 (exit 0)
# - 실패: 요약을 stderr 로 내보내고 exit 2 → asyncRewake 가 Claude 를 깨움 (+ rewakeSummary)
set -uo pipefail

# 품질게이트가 띄운 헤드리스 claude 안에서 다시 도는 것을 막는다 (재귀 테스트 방지).
[[ -n "${AH_HOOK_GUARD:-}" ]] && exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
source "/Users/jung-gonala/.claude/hooks/lib.sh" 2>/dev/null || exit 0
ah_load || exit 0

GLOB=$(ah_get fileGlob)
TESTCMD=$(ah_get testCmd)
[[ -n "$GLOB" && -n "$TESTCMD" ]] || exit 0

# 작업 트리에 변경된 대상 파일(fileGlob 확장자)이 없으면 스킵.
# 커밋된 변경은 이미 TDD 단계에서 테스트됐고, 전체 검증은 handoff 가 담당한다.
EXT="${GLOB##*.}"
git status --porcelain 2>/dev/null | grep -qE "\.${EXT}$" || exit 0

OUTPUT=$($TESTCMD 2>&1)
CODE=$?
END=$(date '+%H:%M:%S')

if [ "$CODE" -eq 0 ]; then
  jq -n --arg m "✅ 테스트 통과 ($END)" '{systemMessage:$m}'
  exit 0
else
  {
    echo "❌ 테스트 실패 ($END):"
    printf '%s\n' "$OUTPUT" | tail -n 30
  } >&2
  exit 2
fi
