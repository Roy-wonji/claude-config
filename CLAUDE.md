<!-- OMC:START -->
<!-- OMC:VERSION:4.13.7 -->

# oh-my-claudecode - Intelligent Multi-Agent Orchestration

You are running with oh-my-claudecode (OMC), a multi-agent orchestration layer for Claude Code.
Coordinate specialized agents, tools, and skills so work is completed accurately and efficiently.

<operating_principles>
- Delegate specialized work to the most appropriate agent.
- Prefer evidence over assumptions: verify outcomes before final claims.
- Choose the lightest-weight path that preserves quality.
- Consult official docs before implementing with SDKs/frameworks/APIs.
</operating_principles>

<delegation_rules>
Delegate for: multi-file changes, refactors, debugging, reviews, planning, research, verification.
Work directly for: trivial ops, small clarifications, single commands.
Route code to `executor` (use `model=opus` for complex work). Uncertain SDK usage → `document-specialist` (repo docs first; Context Hub / `chub` when available, graceful web fallback otherwise).
</delegation_rules>

<model_routing>
`haiku` (quick lookups), `sonnet` (standard), `opus` (architecture, deep analysis).
Direct writes OK for: `~/.claude/**`, `.omc/**`, `.claude/**`, `CLAUDE.md`, `AGENTS.md`.
</model_routing>

<skills>
Invoke via `/oh-my-claudecode:<name>`. Trigger patterns auto-detect keywords.
Tier-0 workflows include `autopilot`, `ultrawork`, `ralph`, `team`, and `ralplan`.
Keyword triggers: `"autopilot"→autopilot`, `"ralph"→ralph`, `"ulw"→ultrawork`, `"ccg"→ccg`, `"ralplan"→ralplan`, `"deep interview"→deep-interview`, `"deslop"`/`"anti-slop"`→ai-slop-cleaner, `"deep-analyze"`→analysis mode, `"tdd"`→TDD mode, `"deepsearch"`→codebase search, `"ultrathink"`→deep reasoning, `"cancelomc"`→cancel.
Team orchestration is explicit via `/team`.
Detailed agent catalog, tools, team pipeline, commit protocol, and full skills registry live in the native `omc-reference` skill when skills are available, including reference for `explore`, `planner`, `architect`, `executor`, `designer`, and `writer`; this file remains sufficient without skill support.
</skills>

<verification>
Verify before claiming completion. Size appropriately: small→haiku, standard→sonnet, large/security→opus.
If verification fails, keep iterating.
</verification>

<execution_protocols>
Broad requests: explore first, then plan. 2+ independent tasks in parallel. `run_in_background` for builds/tests.
Keep authoring and review as separate passes: writer pass creates or revises content, reviewer/verifier pass evaluates it later in a separate lane.
Never self-approve in the same active context; use `code-reviewer` or `verifier` for the approval pass.
Before concluding: zero pending tasks, tests passing, verifier evidence collected.
</execution_protocols>

<hooks_and_context>
Hooks inject `<system-reminder>` tags. Key patterns: `hook success: Success` (proceed), `[MAGIC KEYWORD: ...]` (invoke skill), `The boulder never stops` (ralph/ultrawork active).
Persistence: `<remember>` (7 days), `<remember priority>` (permanent).
Kill switches: `DISABLE_OMC`, `OMC_SKIP_HOOKS` (comma-separated).
</hooks_and_context>

<cancellation>
`/oh-my-claudecode:cancel` ends execution modes. Cancel when done+verified or blocked. Don't cancel if work incomplete.
</cancellation>

<worktree_paths>
State: `.omc/state/`, `.omc/state/sessions/{sessionId}/`, `.omc/notepad.md`, `.omc/project-memory.json`, `.omc/plans/`, `.omc/research/`, `.omc/logs/`
</worktree_paths>

## Setup

Say "setup omc" or run `/oh-my-claudecode:omc-setup`.
<!-- OMC:END -->

<!-- User customizations -->
- 그리고 #4 도 없어 revert 한 로그는 커밋으로 굳이 안남겨도 돼 강제 force push 로 덫어 씌워
- 커밋할 때 절대로 "Co-Authored-By: Claude Sonnet 4 <noreply@anthropic.com>" 추가하지 말 것
- 커밋 메시지는 항상 한국어로 작성할 것. 절대로 영어 사용하지 말고 한국어만 사용

## MCP 자동 사용 규칙 (전체 프로젝트 적용)

### sequential-thinking — 단계별 추론 자동 호출

다음 상황에서 **반드시 먼저** `sequential-thinking` MCP의 사고 도구를 호출해 단계를 분해한 뒤 작업을 시작한다:

- 파일 3개 이상에 걸친 변경, 리팩터링, 디버깅
- 아키텍처 결정, 설계 트레이드오프 분석
- 원인 불명의 버그 진단 (가설 다수, 증거 수집 필요)
- "왜 이렇게 동작하지?" 류의 인과 추적

단순한 1-2 단계 작업(단일 파일 수정, 명령 한 줄, 자명한 질문)에는 호출하지 않는다.

### context7 — 라이브러리 문서 자동 조회

다음 상황에서 **코드를 작성하기 전에** `context7`로 최신 문서를 조회한다:

- SDK / 외부 라이브러리 / 프레임워크 API 사용 (SwiftUI, TCA, Moya, Alamofire, RxSwift, Combine, Firebase, React, Next.js, NestJS 등 모든 외부 라이브러리)
- 새 라이브러리 통합 또는 버전 업그레이드
- 기억에 의존하지 않고 정확한 시그니처/사용법이 필요한 모든 경우

이미 프로젝트 코드에서 패턴이 확립된 경우(grep으로 기존 사용 예가 충분히 확인되는 경우)는 생략 가능.

## 토큰 절약 규칙 (전역, 최우선 적용)

### 응답
- 최대한 짧게. 인사·자기소개·요약 멘트 금지
- 검증 결과는 한 줄 (`✅ typecheck OK`, `❌ build 실패: <원인>`)
- 표는 ≤6행, 헤더 1단계, 시각적 박스/이모지 그래픽 금지
- 사용자가 묻지 않은 옵션·다음 단계·"권장" 코멘트 금지
- "완료했습니다" 같은 명사구 금지 — 결과만

### 도구 사용
- 같은 파일 반복 Read 금지
- Bash 출력은 `| head -N` 또는 `| tail -N` 으로 limit (≤30 lines)
- Grep/Glob 우선, 큰 파일 통째 Read 지양
- 이미 알고 있는 정보는 다시 검증하지 않음

### 에이전트
- subagent 는 사용자 명시 요청 또는 진짜 multi-step (≥3단계 독립 작업) 때만
- 단순 수정·검증·1-2 step 작업은 직접 처리

### context
- 긴 npm install / docker build 같은 장기 작업은 항상 `run_in_background`
- 병렬 가능 작업은 한 메시지에 묶어서 호출
- 이미 보고한 같은 진행상황 재보고 금지

## 모델 라우팅 규칙

작업 복잡도에 맞는 가장 저렴한 모델을 선택한다. 모든 작업에 Opus를 쓰지 않는다.

### 작업별 모델 매핑

- **Haiku 4.5**: 변수명 리네이밍, 주석 추가, import 정리, 포맷팅, 단순 리팩토링
- **Sonnet 4.6**: 새 함수·컴포넌트 작성, 테스트 작성, 버그 수정, 중급 코드 리뷰
- **Opus 4.7**: 아키텍처 결정, 멀티파일 리팩토링, 보안 리뷰, 2시간 이상 막힌 디버깅

### 작업 시작 시 모델 판단 체크리스트

1. 이 작업이 전체 코드 흐름을 바꾸는가? → **Opus**
2. 여러 파일을 동시에 고쳐야 하는가? → **Opus**
3. 한 파일 안에서 로직 작성·수정인가? → **Sonnet**
4. 이름·포맷·주석 수준인가? → **Haiku**

### 적용 방식

- 에이전트 호출 시 `model` 파라미터로 명시적 선택 (`subagent_type` + `model="haiku|sonnet|opus"`)
- 기본은 Sonnet — Haiku/Opus는 위 체크리스트에 맞을 때만
- 같은 비용으로 Haiku는 Opus 대비 약 10배 작업 처리 가능 → 단순 작업은 적극적으로 Haiku 사용

## Context Engineering — 3-Layer 워크플로우

작업을 3개 층으로 분리해서 다룬다. 핵심은 "프롬프트 자체"보다 "Claude가 읽게 될 전체 시스템 상태의 배치".

### Layer 1: Prompt — 지시문

사용자 메시지 그 자체. 변경하지 못함.

### Layer 2: Context — 배치 (사전에 작업자가 책임)

관련 정보가 작업 시작 전에 컨텍스트에 들어와 있어야 한다. 버그 수정 시 자동으로 다음을 수집한다:

- **에러 로그/스택 트레이스** (없으면 사용자에게 명시 요청)
- **관련 테스트 파일** (grep으로 영향 모듈의 `*Tests*`, `*_test*`, `*.spec.*` 위치 확인)
- **최근 변경 이력** (`git log --oneline -5`, 영향 파일은 `git diff HEAD~3 -- <path>`)
- **path-specific 규칙** (해당 디렉토리 내 CLAUDE.md/AGENTS.md, 또는 ARCHITECTURE.md)

### Layer 3: Harness — 환경 (자동화로 강제)

워크플로우가 강제로 실행되도록 hook으로 wiring한다:

- **수정 전 plan 작성**: 가설 1-3개 + 수정 범위 + 검증 방법을 사용자에게 보고하고 동의 후 실행
- **수정 후 자동 테스트**:
  - Swift: `xcodebuild test -scheme <Scheme> -destination 'platform=iOS Simulator,name=iPhone 15'`
  - TypeScript: `npm test` / `vitest run` / `jest`
  - Python: `pytest`
  - 결과 정확히 보고 (통과/실패 개수, 실패 테스트명)
- **실패 시 handoff.md 기록** (자동, `.omc/handoff.md`에 누적): 시도한 가설, 실패 이유, 다음 시도 방향
  - 동일 가설 재시도 금지 — 항상 handoff.md 먼저 읽기

### 단순 작업 예외

1줄 타이포 수정, 변수명 변경, 명백한 import 추가 등은 Layer 2-3 생략 가능. 의심되면 적용한다.