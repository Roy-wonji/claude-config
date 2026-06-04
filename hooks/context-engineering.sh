#!/usr/bin/env bash
# UserPromptSubmit — 버그/에러/디버그 의도 감지 시 3-layer 워크플로우 주입
prompt=$(jq -r '.prompt // empty')
[ -z "$prompt" ] && exit 0

if echo "$prompt" | grep -qiE '(고쳐|버그|에러|에라|fix|error|crash|broken|debug|디버그|망가졌|안돼|안된|왜.*안|exception|stacktrace|traceback)'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext: "[Harness 지시 — 버그 수정 워크플로우 강제]\n\n1. CONTEXT 수집 (수정 시작 전 필수):\n   - 에러 로그/스택 트레이스: 사용자 메시지에 없으면 명시적으로 요청\n   - 관련 테스트 파일: grep으로 영향 받는 모듈의 테스트 위치 확인\n   - 최근 변경: `git log --oneline -5` + `git diff HEAD~3 -- <영향파일>`\n   - 프로젝트 규칙: CLAUDE.md, AGENTS.md\n\n2. PLAN 수립 (수정 전 사용자 동의 필수):\n   - 가설 1-3개 + 각 증거 수준\n   - 수정 범위 (파일/라인 명시)\n   - 검증 방법 (어떤 테스트로 통과 확인할지)\n\n3. EXECUTE & VERIFY:\n   - 수정 후 관련 테스트 자동 실행 (Swift: xcodebuild test, TS: vitest/jest, Python: pytest)\n   - 결과 정확히 보고 (통과/실패 개수, 실패 메시지)\n\n4. ON FAILURE:\n   - .omc/handoff.md에 누적 기록: 시도한 가설, 실패 이유, 다음 시도 방향\n   - 동일 가설 재시도 금지\n\n간단한 1줄 수정(타이포 등)은 1번 단계 생략 가능."
    }
  }'
fi
exit 0
