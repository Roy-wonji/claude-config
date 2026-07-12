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
- **불필요한 주석을 쓰지 않는다**. 이름·코드를 그대로 재진술하는 자명한 주석 금지. 비자명한 의도·트레이드오프·근거(왜 이렇게 했는지)를 담은 꼭 필요한 주석만 남긴다.

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

### 코드 검증·작성 — codex 병행 호출 (codex@openai-codex 플러그인)

- 코드를 **작성/구현**하거나 **검증/리뷰**할 때 codex 플러그인을 함께 호출해 교차 관점을 확보한다.
  - 검증/리뷰: 구현 직후 `/codex:review`(read-only 리뷰). 강한 반증이 필요하면 `/codex:adversarial-review`로 codex의 독립 리뷰를 받는다.
  - 작성/위임: 복잡하거나 위험한 변경은 `/codex:transfer`·`/codex:rescue`로 codex에 위임하고 결과는 `/codex:result`로 회수한다.
  - codex 리뷰는 기존 `code-reviewer`/`verifier` 패스와 **별도 레인**으로 취급한다(자기승인 금지 원칙 유지).
  - codex 미설치/미로그인 시 `/codex:setup`으로 준비한다. 준비 불가하면 기존 파이프라인으로 진행하고 사용자에게 알린다.

### 작업 완료 후 이중 리뷰 게이트 — Claude + Codex 둘 다 필수 (최우선)

모든 코드 작업(구현·수정·리팩터)을 **끝내고 나면**, 완료를 보고·마무리하기 **전에** 아래 두 리뷰를 **로컬에서 반드시 둘 다** 실행한다. 하나만 돌리고 끝내지 않는다.

1. **Claude 심층 리뷰** — `code-reviewer` 에이전트(필요 시 architecture-reviewer·style-inspector·performance-analyst 등 병렬)로 변경분을 리뷰. 자기승인 금지: 구현한 컨텍스트가 아니라 별도 리뷰 레인으로 돌린다.
2. **Codex 심층 리뷰** — `codex exec -c sandbox_mode=read-only --skip-git-repo-check` (또는 `/codex:review`)로 동일 변경분을 독립 리뷰. 강한 반증이 필요하면 `/codex:adversarial-review`.

- 두 리뷰는 **서로 독립 레인**이며 결과를 교차 대조한다. 한쪽이 놓친 걸 다른 쪽이 잡게 한다.
- 리뷰 지적은 **맹목 적용 금지** — 유효성(오탐 여부)을 판단하고, 유효한 것만 surgical 하게 반영한 뒤 재검증(빌드/테스트)한다. 반영/보류 사유를 사용자에게 한 줄씩 보고한다.
- Codex 미설치·미로그인으로 실행 불가하면 `/codex:setup` 시도, 그래도 안 되면 Claude 리뷰만 수행하고 **Codex를 건너뛴 사실을 반드시 사용자에게 알린다**.
- 사소한 1줄 수정(타이포·주석)은 이 게이트를 생략할 수 있다.

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

## 병렬 처리 기본화 (멀티 에이전트) — 명령어 없이 자동

사용자가 `/team`·`/rdr` 같은 명령을 치지 않고 **일반 요청만 해도**, 비자명한 작업은 **기본적으로 병렬 멀티 에이전트로 처리**한다. 트리거 키워드·명령어 불필요 — 작업 복잡도로 스스로 판단한다.

- **독립 하위작업이 2개 이상**이면 Agent 도구로 서브에이전트를 **한 메시지에 묶어 병렬 소환**(동시 실행, 순차 금지).
- **리서치 → 초안 작성 → 검토처럼 역할이 갈리는 작업**은 역할별 서브에이전트로 분담하거나 `/team` staged pipeline으로 병렬 실행한다.
- **여러 파일/모듈 조사·분석**은 Explore 에이전트를 병렬 fan-out 후 결과를 취합한다.
- **장기 작업**(빌드·테스트·설치 등)은 항상 `run_in_background`.

### 병렬 예외 (직접 처리)

1~2단계 자명한 작업(단일 파일 수정, 한 줄 답변, 단순 질의)은 오버헤드 방지를 위해 병렬 없이 직접 처리한다. 의심되면 병렬을 택한다.

## Fable-5급 산출 지향 (모델 교체 아님, 최우선) — `fable-grade` 스킬

Haiku·Sonnet·Opus 어느 모델로 돌든 **시니어 아키텍트(Fable-5)급 결과에 가깝게** 끌어올리는 게 기본값이다. **주의: 실행 모델을 Fable 5로 바꾸는 게 아니다**(불가능) — 작업 규율을 강제해 지금 모델이 자기 능력 상한 안에서 최대치를 내게 하는 것이다. 추론 깊이 자체는 모델에 묶이지만, 누락 방지·근거 강제·구조화·검증은 크게 오른다. "똑똑한 모델"이 아니라 **규율**이 (도달 가능한 범위에서) 품질을 만든다. 아키텍처 설계·멀티파일 리팩터·마이그레이션·구조 재설계·근인 디버깅에서는 `fable-grade` 스킬을 발동해 아래 8기둥을 체크리스트로 밟는다.

1. **근거 우선** — 모든 주장에 `파일:라인` 인용. 파일 읽기 전 단정·추측 금지. 모르면 "확인 필요".
2. **규약 추출** — 레퍼런스/기존 코드에서 암묵 규칙을 근거와 함께 명시 규칙(R1…)으로 역추적. 그림만 보지 말고 코드로.
3. **현행 갭 진단** — "구조가 안 좋다"(x) → 구체 위반 사례 `파일:라인`(o).
4. **근인 1문장** — 증상 때우기 금지, 근본 원인 도출.
5. **현실 규모 단순화** — 레퍼런스 맹목 복제 금지. 실제 규모 측정 후 축소/확장. 불필요 추상화·타깃 폭발 금지.
6. **트레이드오프 표면화** — 결정마다 A/B + 권고 + 이유 + 숨은 비용. 가정은 "가정 명시:"로 박기.
7. **검증 가능한 마이그레이션** — 리스크 오름차순 단계 + 단계별 성공 기준(빌드/테스트/그래프 위반 0건).
8. **하드 제약 존중** — CI 스킴명·경로·파이프라인 등 바꾸면 깨지는 것 먼저 식별, 전 단계 불변 유지, 어기면 사전 고지.

큰 구조 변경은 **구현 전 청사진 승인 게이트**를 둔다. 세부 프로토콜·iOS/Tuist 워크드 레퍼런스(xcconfig base+#include 상속, 단일 타깃+다중 config, 워크스페이스 config 일관성, 중나식 레이어드 모듈 규약)·디버깅 규율(환경오류 vs 코드오류 구분)은 `fable-grade` 스킬 본문 참조.
