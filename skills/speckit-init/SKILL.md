---
name: "speckit-init"
description: "현재 프로젝트에 spec-kit 스캐폴드(.specify/)를 설치한다. speckit-specify / speckit-plan / speckit-tasks 등 다른 speckit 스킬을 쓰기 전에 한 번 실행한다. '.specify 없음' 오류가 날 때도 사용한다."
argument-hint: "(옵션) --force"
user-invocable: true
disable-model-invocation: false
---

# spec-kit 초기화

다른 `speckit-*` 스킬은 프로젝트 루트의 `.specify/` 디렉토리(템플릿·스크립트·헌법)를 전제로 동작한다.
이 스킬은 roy 플러그인에 vendoring 된 spec-kit 자산을 현재 프로젝트로 복사한다.

## 실행

```bash
"${CLAUDE_PLUGIN_ROOT}/scripts/speckit-init.sh" $ARGUMENTS
```

이미 `.specify/` 가 있으면 아무것도 하지 않는다. 덮어쓰려면 `--force` 를 넘긴다.

## 설치 후

`.specify/` 에는 다음이 들어간다:

- `templates/` — spec / plan / tasks / checklist / constitution 템플릿
- `scripts/bash/` — create-new-feature, setup-plan, setup-tasks, check-prerequisites
- `memory/constitution.md` — 프로젝트 헌법 (`speckit-constitution` 으로 채운다)
- `workflows/`, `integrations/` — spec-kit 워크플로 메타데이터

## 이후 흐름

1. `speckit-constitution` — 프로젝트 원칙 수립
2. `speckit-specify` — 기능 명세 작성
3. `speckit-plan` — 기술 설계
4. `speckit-tasks` — 실행 가능한 태스크 분해
5. `speckit-implement` — 구현

선택: `speckit-clarify` (plan 전), `speckit-checklist` (plan 후), `speckit-analyze` (implement 전).

출처: https://github.com/github/spec-kit (MIT)
