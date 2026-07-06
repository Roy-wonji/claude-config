#!/usr/bin/env bash
# PostToolUse(Edit|Write) — 정적 품질 게이트 (config 기반, 플랫폼 규칙 선택)
# 플러그인의 quality-gate.<platform>.md 기준으로 편집된 대상 파일 변경분을 headless LLM이 판정한다.
# 단계별 결과(통과/실패)를 additionalContext로 Claude에 주입하고, 위반이면 decision:block으로 차단한다.
# 게이트 자체 오류(config/claude 없음/빈 응답/형식 불일치)는 통과(exit 0) — 게이트 오류로 작업을 막지 않는다.
set -uo pipefail

# 이 게이트가 띄운 헤드리스 claude 안에서 훅이 다시 도는 것을 막는다 (재귀·중복 테스트 방지).
[[ -n "${AH_HOOK_GUARD:-}" ]] && exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
source "/Users/jung-gonala/.claude/hooks/lib.sh" 2>/dev/null || exit 0
ah_load || exit 0

GLOB=$(ah_get fileGlob)
MODEL=$(ah_get qualityGateModel)
PLATFORM="$AH_PLATFORM"
[[ -n "$GLOB" ]] || exit 0

INPUT=$(cat)
FILE=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty')

# 1. 대상 파일만, 생성물 제외
case "$FILE" in $GLOB) ;; *) exit 0 ;; esac
[[ "$FILE" == *Generated* || "$FILE" == *.generated.* || "$FILE" == */Derived/* ]] && exit 0
[[ -f "$FILE" ]] || exit 0

# 2. 변경분 확보 (tracked: diff, untracked 신규: 전체 내용)
DIFF=$(git diff HEAD -- "$FILE" 2>/dev/null)
[[ -z "$DIFF" ]] && DIFF=$(cat "$FILE")

# 3. 변경 규모 게이트 — 사소한 편집 스킵
[[ -z "$DIFF" ]] && exit 0
[[ $(printf '%s' "$DIFF" | wc -l) -lt 5 ]] && exit 0

# 4. 프롬프트 사양 로드 — 플러그인의 platform별 규칙 (rules/<platform>/quality-gate.md)
ROOT="/Users/jung-gonala/.claude"
SPEC_FILE="$ROOT/rules/${PLATFORM}/quality-gate.md"
[[ -f "$SPEC_FILE" ]] || exit 0
SPEC=$(cat "$SPEC_FILE")

# 5. headless LLM 판정 (config 모델). 호출 실패 시 차단하지 않는다.
command -v claude >/dev/null 2>&1 || exit 0
RESULT=$(AH_HOOK_GUARD=1 claude -p "$SPEC

---
파일: $FILE
변경분:
$DIFF" --output-format json --model "$MODEL" 2>/dev/null)

TEXT=$(printf '%s' "$RESULT" | jq -r '.result // empty' 2>/dev/null)
[[ -z "$TEXT" ]] && exit 0   # 판정 실패 → 통과 (게이트 오류로 작업을 막지 않음)
TEXT=$(printf '%s' "$TEXT" | sed '/^```/d')   # 모델이 ```json 코드펜스로 감싸면 제거
printf '%s' "$TEXT" | jq -e '.steps' >/dev/null 2>&1 || exit 0   # 형식 어긋나면 통과

# 6. 단계별 결과를 Claude 컨텍스트로 주입. 위반이 있으면 차단까지.
STEPS=$(printf '%s' "$TEXT" | jq -r '.steps[] | "  \(if .pass then "✅" else "❌" end) \(.name)"')
VIOL=$(printf '%s' "$TEXT" | jq -r '.violations[]? | "  L\(.line) [\(.rule)] \(.fix)"')

if [[ -n "$VIOL" ]]; then
  CTX="품질 게이트 ($FILE) — 실패
$STEPS
위반:
$VIOL"
  jq -n --arg c "$CTX" '{decision:"block", reason:$c, hookSpecificOutput:{hookEventName:"PostToolUse", additionalContext:$c}}'
else
  CTX="품질 게이트 ($FILE) — 통과
$STEPS"
  jq -n --arg c "$CTX" '{hookSpecificOutput:{hookEventName:"PostToolUse", additionalContext:$c}}'
fi
exit 0
