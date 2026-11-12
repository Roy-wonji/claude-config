---
description: SDD 워크플로우 진입점 — 진행 상태를 감지하고 적절한 단계로 라우팅한다
argument-hint: "[슬러그] (비우면 진행 상태 스캔)"
---

# /workflow

SDD(Spec-Driven Development) 워크플로우의 의도적 시작 트리거.
진행 중인 작업을 감지해 이어서 진행하거나, 새 작업을 시작한다.

단계: `Request → Understand → Plan → Implement → Verify → Handoff`
각 단계는 독립 스킬이며, **각 단계 종료 시 사람이 검토하고 통과/복귀를 결정한다.**

외부 티켓 시스템(JIRA 등)에 의존하지 않는다 — 요구사항은 사용자 설명·GitHub 이슈·Figma로 모으고,
산출물은 전부 로컬(`.tracking/`)에 남긴다.

## 1. 진행 상태 스캔

`tracking.dir`(`ios-harness.config.json`, 기본 `.tracking`) 아래 모든 폴더를 스캔한다.
각 폴더는 하나의 작업이며, 폴더명은 작업을 설명하는 **슬러그**(kebab-case, 예: `social-login`)다.

각 작업의 **도달한 단계**를 tracking 폴더의 파일 존재로 판단한다:

| 존재하는 파일 | 도달 단계 | 다음 단계 |
|---|---|---|
| (없음) | — | ticket-brief |
| `request.md` | Request 완료 | understand |
| `understand.md` | Understand 완료 | plan |
| `task.md` | Plan 완료 / 구현 중 | implement |

`request.md` 상단 frontmatter 에서 **타입**(`type`)과 **제목**(`title`)을 읽고,
`task.md`가 있으면 **작업 단계** 체크리스트의 완료 개수(`- [x]` / 전체)를 센다.

## 2. 보고

미완료 작업을 아래 형식으로 사용자에게 보고한다:

```
미완료 작업:
  1. [feat] 소셜 로그인 화면 추가      → Implement (task 3/7)
  2. [fix]  실행 시 크래시             → Plan 검토 대기

새 작업을 시작하려면 작업 설명을 알려주세요.
```

미완료 작업이 없으면 그 사실을 알리고 새 작업 시작을 안내한다.

## 3. 분기

`$ARGUMENTS`로 슬러그가 주어졌으면 곧바로 해당 작업으로 진행한다.

- **이어서 진행**: 사용자가 목록에서 작업을 선택 → 해당 폴더의 다음 단계로 이동
- **새 작업**: 작업 설명을 받아 `.tracking/{슬러그}/` 생성 → ticket-brief부터 시작
  - 슬러그는 제목 기반으로 제안하되 사용자에게 확인받는다.

## 4. 단계 실행과 검토 게이트

선택된 다음 단계의 스킬을 실행한다.

**단계가 끝나면 멈추고** 결과(생성/수정된 산출물)를 사용자에게 보여준 뒤 물어본다:

- **통과** → 다음 단계로 진행
- **복귀** → 문제가 있는 이전 단계로 돌아가 다시 진행

> 사용자 확인 없이 여러 단계를 연속 실행하지 않는다. SDD의 핵심은 단계별 검토다.

### Implement 단계 진행

Implement 단계는 `implement` 스킬에 위임한다. implement가 `task.md`를 단계별로 진행하며
각 단계 성격에 따라 `tdd` / UI 구현 / 직접 구현으로 라우팅하고, 단계가 끝날 때마다
task.md 체크박스를 실시간으로 갱신한다. 계획 오류 발견 시 멈추고 plan/understand로 복귀한다.
(자세한 절차는 `implement` 스킬 참조)

## 단계 ↔ 산출물

| 단계 | 스킬 | 산출물 | 위치 |
|---|---|---|---|
| Request | ticket-brief | `request.md` | tracking |
| Understand | understand | `understand.md` | tracking |
| Plan | plan | `task.md` | tracking |
| Implement | implement (→ tdd / UI / 직접) | 코드 변경 (+ 체크포인트 커밋) | — |
| Verify | (커밋 훅 자동) | — | — |
| Handoff | handoff | PR (gh) | — |
