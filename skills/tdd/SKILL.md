---
name: tdd
description: Swift Testing 기반 TDD 파이프라인 (Plan → Red → Green → Review → Refactor → Commit)
disable-model-invocation: true
argument-hint: [feature-description]
---

# TDD Pipeline (Swift / iOS)

다음 단계를 **순서대로** 실행한다. 단계를 건너뛰지 않는다.
프로젝트별 Scheme, 테스트 명령어, Mock 패턴은 프로젝트 루트의 `CLAUDE.md` / `AGENTS.md` 를 먼저 읽어 확인한다.

## 단계

### 1. Plan

`EnterPlanMode` 로 진입하여 `$ARGUMENTS` 에 대한 구현 계획을 수립한다.

- 기능 명세를 분석하고 구현 범위를 정한다.
- 영향 받는 모듈(Presentation / Domain / Data / Network)과 의존성 방향을 명시한다.
- TCA Feature 인 경우: State / Action / Reducer 분리, Effect 사용 여부, 네비게이션 영향 명시.
- 사용자 확인 후 `ExitPlanMode` 로 빠져나온다.

### 2. Red — 테스트 작성

`~/.claude/agents/test-engineer.md` 를 읽고, 그 내용을 프롬프트로 사용하여 Agent 를 스폰한다.

전달할 정보:
- 기능 명세
- 관련 소스 파일 경로 (Reducer / UseCase / Repository 등)
- 기존 테스트 파일 경로 (있는 경우)
- 프로젝트의 Mock / TestStore 패턴 (CLAUDE.md / AGENTS.md 참조)

### 3. Red 확인

테스트 명령어를 실행하여 **테스트가 실패하는지** 확인한다.

프로젝트별 명령어 예시:
```bash
# Tuist 기반
tuist test
tuist test --filter <Scheme>

# xcodebuild 기반
xcodebuild test \
  -workspace <Workspace>.xcworkspace \
  -scheme <Scheme> \
  -destination 'platform=iOS Simulator,name=iPhone 16 Pro,OS=latest'

# SPM 기반
swift test
```

- 컴파일 실패 시 테스트 코드를 수정한다.
- 테스트가 이미 통과하면 테스트가 올바른지 재검토한다 (테스트가 약하거나, 이미 구현돼 있을 가능성).

### 4. Green — 최소 구현

테스트를 통과하는 **최소한의 구현 코드**를 직접 작성한다.

- 테스트가 요구하지 않는 기능을 추가하지 않는다.
- TCA Reducer 인 경우 Effect 의 cancellation, MainActor 격리, Sendable 을 함께 고려한다.
- WeaveDI 인터페이스 등록이 필요한 경우 등록 코드도 포함한다.

### 5. Green 확인

3단계와 동일한 명령어로 **모든 테스트가 통과**하는지 확인한다.

- 실패 시 구현 코드를 수정하고 재실행한다.
- 동일 가설로 반복 실패 시 `.omc/handoff.md` 에 시도 내역을 기록하고 사용자에게 보고한다.

### 6. Review

`~/.claude/agents/code-reviewer.md` 를 읽고, 그 내용을 프롬프트로 사용하여 Agent 를 스폰한다.

- 변경된 파일 경로와 구현 내역 요약을 전달한다.
- 리뷰 결과를 사용자에게 보여주고, **심각도 '상'** 항목이 있으면 수정 여부를 확인한다.
- 수정이 필요하면 4단계로 돌아간다.

### 7. Refactor

`~/.claude/agents/code-simplifier.md` 를 읽고, 그 내용을 프롬프트로 사용하여 Agent 를 스폰한다.

- 대상 파일 경로, 테스트 파일 경로, 리뷰 의견을 전달한다.
- 리팩터링 후 3단계 명령어로 **테스트가 여전히 통과**하는지 확인한다.

### 8. Commit

`/commit` 을 실행한다.

## 규칙

- 각 단계 완료 후 사용자에게 결과를 보고하고 진행 여부를 확인한다.
- 테스트 명령어, Scheme, Mock 패턴 등 프로젝트별 설정은 항상 프로젝트 `CLAUDE.md` / `AGENTS.md` 를 참조한다.
- 커밋 메시지는 한국어로 작성한다 (`/commit` 규칙 따름).
