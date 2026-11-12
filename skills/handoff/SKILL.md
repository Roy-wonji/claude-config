---
name: handoff
description: 구현 완료 후 마무리 단계. gh로 PR을 생성한다. 외부로 나가는 작업(푸시·PR)은 실행 전 사용자에게 확인받는다.
---

# handoff

모든 단계가 끝난 뒤 결과를 정리하고 넘기는 단계.
PR로 **외부에 나가는 작업**이므로, 각 작업은 **실행 전 사용자에게 확인받는다.**

## When to Activate

- SDD 워크플로우의 **Handoff 단계** — 구현·검증이 끝나 결과를 넘길 때
- PR 생성이 필요할 때

## Input

- tracking 폴더 (`request.md`, `understand.md`, `task.md`)
- 현재 작업 브랜치 (`feat/{슬러그}` 등)

## Procedure

### 1. 마무리 확인

- `task.md`의 모든 작업 단계가 `- [x]`이고 완료 기준(DoD)이 충족됐는지 확인한다.
- 테스트가 GREEN인지 확인한다. 미완이면 멈추고 Implement로 되돌린다.

### 2. PR 생성

- **Draft PR로 생성한다** (`gh pr create --draft`). 전체를 확인한 뒤 Ready로 전환하기 위함.
- base 브랜치: `ios-harness.config.json` 의 `git.baseBranch` (기본 `main`). 작업 브랜치 → base, **Squash Merge**.
- 제목: `type: 간결한 설명` (한국어). type 은 request 의 `type`(feat/fix/refactor…).
- 본문: 이 스킬의 `template.md` 형식을 따라 채운다. **한국어로 작성**한다.
- 커밋 메시지·PR 본문에 `Co-Authored-By` 등 자동 서명 라인을 **절대 추가하지 않는다.**
- 푸시·PR 생성 **전에 사용자에게 확인받는다.**

## Done

- Draft PR 생성됨 (base `main`)

완료 후 PR 링크를 사용자에게 정리해 보여준다.
