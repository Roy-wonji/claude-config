---
description: 리서치 → 초안 작성 → 검토 3역할 병렬 파이프라인 (research-draft-review)
---

다음 작업을 oh-my-claudecode `/team` 파이프라인으로 **리서치 → 초안 작성 → 검토** 3역할 병렬 실행해줘.

작업: $ARGUMENTS

역할 분리(독립 단계, tmux 병렬):
1. **리서치** — 코드/문서/웹 조사로 사실·근거 수집 → `.omc/research/`에 정리 (explore/analyst 역할)
2. **초안 작성** — 리서치 결과를 바탕으로 문서/코드 초안 작성 (writer/executor 역할). 리서치 완료에 의존.
3. **검토** — 초안의 정확성·누락·품질을 검증하고 수정 제안/적용 (critic/code-reviewer/verifier 역할). 초안 완료에 의존.

규칙:
- `/oh-my-claudecode:team` 의 staged pipeline(team-plan → team-exec → team-verify)을 사용.
- 각 단계 산출물은 파일로 남기고, 단계 전환 시 `.omc/handoffs/`에 핸드오프 기록.
- 작업이 단순(1~2단계)하면 팀을 띄우지 말고 직접 처리. 멀티파일/리서치/리뷰가 필요한 경우에만 3역할 병렬.
