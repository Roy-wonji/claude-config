<!-- OMC:START -->
<!-- OMC:VERSION:5.7.22 -->

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
`haiku` (quick lookups), `sonnet` (standard), `opus` (architecture, deep analysis), `fable` (Claude Fable 5, above Opus).
The session model set via `/model` governs the main loop only; delegated agents run on their pinned tier unless you pass `model` explicitly or set a per-agent `agents.<name>.model` override.
Direct writes OK for: `~/.claude/**`, `.omc/**`, `.claude/**`, `CLAUDE.md`, `AGENTS.md`.
</model_routing>

<skills>
Invoke via `/oh-my-claudecode:<name>`. Trigger patterns auto-detect keywords.
**Canonical workflows (Tier-0):** `plan` → `execute` → `review` → `verify`. Roles: `planner` → `executor` → `reviewer` → `verifier`. `deep-interview` and `ralplan` are independent Tier-0 planning workflows. `research` and `team` are internal lanes; `autopilot`, `autoresearch`, `ralph`, and `ultragoal` remain directly invocable.
**Retired in 5.0.0 (removed, not aliased):** `ultrawork`, `ultraqa`, `ultrapilot`, `swarm`, `pipeline`, `merge-readiness`, `deep-dive`, `sciomc`, `ccg`, `omc-teams`, `setup`, `mcp-setup`, `omc-reference`, `learner`, `writer-memory`, `local-build-reminder`. Use `execute`, `verify`, `review`, `research`, `omc-setup`, `wiki`, `remember`, or `team` instead.
Keyword triggers: `"autopilot"→autopilot`, `"ralplan"→ralplan`, `"deep interview"→deep-interview`, `"deslop"`/`"anti-slop"`→ai-slop-cleaner (→`review`, opt-in), `"deep-analyze"`→analysis mode, `"tdd"`→TDD mode, `"deepsearch"`→codebase search, `"ultrathink"`→deep reasoning, `"cancelomc"`→cancel. Team orchestration is explicit via `/team`.
Release is maintainer-only `omc release` (see Migration Guide); `/release` remains a compatibility alias and never bypasses the release boundary.
Detailed agent catalog, tools, team pipeline, commit protocol, and full skill registry live in the `wiki` skill when skills are available, including reference for `explore`, `planner`, `architect`, `executor`, `designer`, and `writer`; this file remains sufficient without skill support. Specialists remain internal/routable modules (document-specialist, test-engineer, designer, etc.) — not Tier-0 workflows.
</skills>

<verification>
Verify before claiming completion. Size appropriately: small→haiku, standard→sonnet, large/security→opus.
If verification fails, keep iterating.
</verification>

<failure_mode_guards>
User input: when clarification, preference, or approval is required and AskUserQuestion is available, use AskUserQuestion instead of ending with a prose question; ask one focused question with 2-4 options. Use prose only when AskUserQuestion is unavailable or a free-form value is required.
Session/worktree continuity: before editing after resume/compaction or inside a linked worktree, re-check `git status --short --branch`, current cwd, and relevant `.omc/state/` or `.omc/handoffs/` artifacts so work does not continue on the wrong branch or stale context.
No fake completion: TODO-style placeholder notes, `test.skip`/`.only`, stub tests, and unimplemented branches are blockers, not evidence. Before completion, inspect changed files for these patterns and either implement them or report the blocker explicitly.
</failure_mode_guards>

<execution_protocols>
Broad requests: explore first, then plan. 2+ independent tasks in parallel. `run_in_background` for builds/tests.
Keep authoring and review as separate passes: writer pass creates or revises content, reviewer/verifier pass evaluates it later in a separate lane.
Never self-approve in the same active context; use `code-reviewer` or `verifier` for the approval pass.
Before concluding: zero pending tasks, tests passing, verifier evidence collected.
</execution_protocols>

<hooks_and_context>
Hooks inject `<system-reminder>` tags. Key patterns: `hook success: Success` (proceed), `[MAGIC KEYWORD: ...]` (invoke skill), `The boulder never stops` (continuation mode active).
Persistence: `<remember>` (7 days), `<remember priority>` (permanent).
Kill switches: `DISABLE_OMC`, `OMC_SKIP_HOOKS` (comma-separated).
</hooks_and_context>

<cancellation>
`/oh-my-claudecode:cancel` ends execution modes. Cancel when done+verified or blocked. Don't cancel if work incomplete.
</cancellation>

<worktree_paths>
State root: `.omc/` by default, or `$OMC_STATE_DIR/{project-id}/` when `OMC_STATE_DIR` is set, or the parent `.omc/` when a `.omc-workspace` marker anchors a multi-repo workspace. Runtime state includes `.omc/state/`, `.omc/state/sessions/{sessionId}/`, `.omc/notepad.md`, `.omc/project-memory.json`, `.omc/plans/`, `.omc/research/`, `.omc/logs/`, `.omc/artifacts/`, `.omc/handoffs/`, and `.omc/ultragoal/`. These are ignored operational artifacts by default; `.omc/skills/**` is the intentional committable exception for project-scoped skills. In linked git worktrees, local `.omc/` state is removed with the worktree unless centralized via `OMC_STATE_DIR`.
</worktree_paths>

## Setup

Say "setup omc" or run `/oh-my-claudecode:omc-setup`.

<!-- OMC:END -->

<!-- User customizations -->
<!-- USER:COST-GUARD:START -->
## User cost and delivery guardrails

- Before starting or continuing a task, name the concrete deliverable in one sentence (PR title, file to change, or expected command output).
- Stop and check with the user if more than 10 minutes of active work pass without a meaningful task-related edit, or if the same approach fails twice.
- Do not make a third attempt on any single fix without the user's explicit approval. Report the two attempts, their failures, and the proposed next step; wait for the user's answer.
- Do not evade these limits with cosmetic edits, renamed approaches, or delegation. Track elapsed work and attempts across agents and context compaction.
- These user-requested stop conditions take precedence over general auto-continue, persistence, and retry instructions in this file. Do not infer approval from silence.
<!-- USER:COST-GUARD:END -->

<!-- USER:CLAUDEX-AUTO:START -->
## Claudex Loop 자동 실행

- 모든 사용자 작업에서 사용자가 `/claudex-loop`나 `$claudex-loop`를 입력하지 않아도 설치된 `claudex-loop` 스킬을 먼저 읽고 해당 워크플로를 자동 실행한다. 단순 질의와 한 파일 수정도 예외로 두지 않는다. 실제 실행 중인 호스트가 Claude인지 Codex인지 확인해 상대 CLI를 검토자로 사용한다.
- 계획만 요청받으면 계획 검토까지만, 구현을 요청받으면 계획 검토와 구현 후 교차 점검까지 수행한다. 사용자가 다른 워크플로나 협업 방식, 단독 실행을 명시하면 그 요청을 우선한다.
- 작업 크기에 맞춰 계획과 검증을 짧게 할 수 있지만 상대 CLI를 통한 교차 검토 단계는 생략하지 않는다.
- Claudex Loop가 호출한 검토자·구현자·점검자 세션에서는 맡은 역할만 수행하고 Claudex Loop를 다시 시작하지 않는다. 상대 CLI를 사용할 수 없으면 진행 상태와 장애를 명확히 알리고 교차 검토를 완료한 것처럼 보고하지 않는다.
- 위의 사용자 비용 제한과 기존 승인·커밋·푸시 규칙을 그대로 지킨다. 특히 10분 동안 의미 있는 수정이 없거나 같은 접근이 두 번 실패하면 멈춰 사용자에게 확인하고, 승인 없이 세 번째 시도를 하지 않는다.
<!-- USER:CLAUDEX-AUTO:END -->

- 그리고 #4 도 없어 revert 한 로그는 커밋으로 굳이 안남겨도 돼 강제 force push 로 덫어 씌워
- 커밋할 때 절대로 "Co-Authored-By: Claude Sonnet 4 <noreply@anthropic.com>" 추가하지 말 것
- 커밋 메시지는 항상 한국어로 작성할 것. 절대로 영어 사용하지 말고 한국어만 사용
- 모든 응답(설명, 진행 보고, 요약, thinking 포함)은 항상 한국어로 작성할 것. 코드/식별자/명령어만 원문 유지
- 작업은 병렬로 벌리지 말고 한 단계씩 순차적으로 진행하고, 각 단계 완료를 확인한 뒤 다음 단계로 넘어갈 것

## 핵심 코딩 원칙 (4원칙) — 최우선

> 출처: https://lsjsj92.tistory.com/717 (Claude Code CLAUDE.md 가이드)

### 1. Think Before Coding — 코딩 전 사고
- 코드를 시작하기 전에 **가정을 명시**한다. 모호하면 추측으로 덮지 말고 질문하거나 드러낸다.
- **트레이드오프를 숨기지 않고** 표면화한다.
- 불확실성·혼란을 감추지 않는다 — 모르면 모른다고 한다.

### 2. Simplicity First — 단순함 우선
- 불필요한 **추상화를 만들지 않는다**.
- **요청하지 않은 기능**을 추가하지 않는다.
- 동작하는 가장 단순한 해법을 택한다.

### 3. Surgical Changes — 외과적 변경
- 변경된 **모든 줄이 사용자 요청과 1:1로 직접 추적**되어야 한다.
- 요청 범위 밖의 리팩터링·포맷팅·import 정리·파일 이동을 끼워 넣지 않는다.
- diff를 최소로 유지한다.

### 4. Goal-Driven Execution — 목표 주도 실행
- **검증 가능한 성공 기준**을 먼저 정의한다.
- 명령형 단계 나열보다 **목표를 제시**하고 달성 여부를 검증한다.
- 완료를 주장하기 전에 기준 충족을 **증거로 확인**한다.

## 자동 하네스·팀 적용 (명령어 없이 기본 동작, 최우선)

키워드/슬래시 명령 없이도 **작업 성격에 부합하면 해당 스킬/팀을 자동으로 띄운다.** 사용자가 명시하지 않아도 적용한다. (단순 1-2 step 자명한 작업은 직접 처리)

### harness (revfactory) — 항상 우선 고려
- 새 도메인·프로젝트의 자동화 체계가 필요하거나, 작업이 여러 전문 역할(설계/구현/검증/배포 등)로 분해되면 **먼저 `harness` 스킬로 에이전트 팀 구성을 검토**한 뒤 진행한다.

### 최근 추가 팀 — 작업 매칭 시 자동 호출
- 코드 리뷰·PR 검토 → `code-reviewer` (스타일→보안→성능→아키텍처 5인 팀)
- 테스트 작성·커버리지·CI 테스트 → `test-automation`
- CI/CD·배포 파이프라인 → `cicd-pipeline`
- 레거시 리팩터링·마이그레이션 → `legacy-modernizer`
- 모바일 앱 개발·UX·API연동·스토어 → `mobile-app-builder` (app-developer·ux-designer·api-integrator·qa-engineer·store-manager)

### 모든 코드 작업 — karpathy 4원칙 상시 적용
- 코드 작성·리뷰·리팩터 시 `karpathy-guidelines`의 4원칙(Think Before Coding / Simplicity First / Surgical Changes / Goal-Driven Execution)을 항상 준수한다.

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
# graphify
- **graphify** (`~/.claude/skills/graphify/SKILL.md`) - any input to knowledge graph. Trigger: `/graphify`
When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

# gstack
- gstack(`~/.claude/skills/gstack`)이 설치되어 있다. 웹 탐색은 모두 gstack의 `/browse` 스킬로 하고, `mcp__claude-in-chrome__*` 도구는 쓰지 않는다.
- 업데이트는 `/gstack-upgrade`로 한다.

## Ralph Loop·Hookify 전역 필수 적용

- `ralph-loop@claude-plugins-official`, `hookify@claude-plugins-official`를 사용자 범위로 설치해 둔다(2026-11-10).
- 여러 단계 구현·디자인 대조·마이그레이션 작업은 Ralph Loop로 진행한다. 시작 명령은 `/ralph-loop "<작업과 검증 기준>" --max-iterations <N> --completion-promise "<완료 문장>"`이다. 반복 횟수 상한과 완료 문장을 반드시 준다. 완료 문장은 검증 기준을 증거로 확인했을 때만 출력한다.
- 위의 비용 제한(10분 무편집·같은 접근 2회 실패 시 멈춤, 승인 없는 세 번째 시도 금지)이 Ralph Loop보다 우선한다. 루프 안에서도 같은 접근이 두 번 실패하면 `/cancel-ralph`로 멈추고 보고한다.
- 사용자가 같은 지적을 두 번 이상 하거나 지켜야 할 규칙이 생기면 `/hookify`로 훅 규칙을 만든다.
