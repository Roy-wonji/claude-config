# claude-config

> Claude Code의 **agent / skill** 을 여러 맥에서 공유하기 위한 개인 설정 저장소.
> Swift / iOS (TCA + Clean Architecture) 프로젝트 기준으로 정리되어 있다.

## 📱 사용 환경

- **타겟 스택**: Swift 6, SwiftUI, TCA 1.25+, Tuist 4
- **테스트**: Swift Testing (`@Test`, `@Suite`)
- **DI**: WeaveDI 3.4.1
- **네비게이션**: TCAFlow `@FlowCoordinator`
- **사용 프로젝트**: `Attendance_iOS`, `Picke-iOS` 등

## 🗂 구성

```
claude-config/
├── agents/                       # 에이전트
│   ├── code-reviewer.md          # 10년차 시니어 Swift/iOS 리뷰어 (read-only)
│   ├── code-simplifier.md        # 기능 변경 없는 리팩터링
│   ├── test-engineer.md          # Swift Testing 기반 테스트 작성
│   ├── test-auto-pr-agent.md     # 도메인별 자동 테스트 + PR 파이프라인
│   └── ios-performance-optimizer/ # PFW 통합 iOS 성능 최적화
├── skills/                       # 스킬 (자체 + 외부 통합)
│   ├── 자체:                      # commit, tdd
│   ├── 성능/SwiftUI:              # ios-performance, ios-performance-pfw,
│   │                               ios-performance-uikit-guide, swiftui-auditor,
│   │                               swiftui-uikit-interop, swiftui-liquid-glass
│   ├── 아키텍처:                   # tca-optimizer, clean-architecture
│   ├── Swift/iOS 일반:             # swift-ios-skills, ios-uikit-expert,
│   │                               apple-design-system, apple-skills
│   ├── Hudson "Pro" 시리즈 (twostraws):  swiftui-pro, swiftdata-pro,
│   │                                    swift-testing-pro, swift-concurrency-pro
│   ├── Concurrency (AvdLee):       # swift-concurrency
│   ├── 신규 영역:                  # swift-api-design-guidelines,
│   │                                ios-accessibility, swift-security-expert,
│   │                                ios-simulator
│   └── Dimillian/Skills:           # swiftui-ui-patterns, swiftui-view-refactor,
│                                    app-store-changelog, ios-debugger-agent
├── docs/
│   ├── agent/                    # iOS 프로젝트용 가이드 13종 (TCA/SwiftUI/DI/성능/Git/Dev 등)
│   ├── external-swift-agent-skills.md       # twostraws 카탈로그 인덱스
│   └── external-agents-md/SwiftAgents.md    # Hudson AGENTS.md 템플릿
└── ATTRIBUTIONS.md                          # 외부 자산 출처/라이선스
```

## 🔌 사용 중인 플러그인

`plugins/installed_plugins.json` · `plugins/known_marketplaces.json` 기준. (마켓플레이스 = 설치 소스)

| 플러그인 | 마켓플레이스 | 소스 repo | 용도 |
|---|---|---|---|
| `oh-my-claudecode` | omc | [Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) | 멀티 에이전트 오케스트레이션(OMC) — autopilot/ultrawork/team 등 |
| `superpowers` | superpowers-dev | [obra/superpowers](https://github.com/obra/superpowers) | 스킬 발견/실행 프레임워크 |
| `agent-council` | team-attention-plugins | [team-attention/agent-council](https://github.com/team-attention/agent-council) | 다중 에이전트 합의/심의 |
| `developer-kit-typescript` | developer-kit | [giuseppe-trisciuoglio/developer-kit](https://github.com/giuseppe-trisciuoglio/developer-kit) | NestJS/React/Expo TS 개발 전문 에이전트 |
| `warp` | claude-code-warp | [warpdotdev/claude-code-warp](https://github.com/warpdotdev/claude-code-warp) | Warp 터미널 연동 |
| `swift-lsp` | claude-plugins-official | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | Swift LSP 통합 |
| `code-review` | claude-plugins-official | 〃 | 코드 리뷰 명령 |
| `commit-commands` | claude-plugins-official | 〃 | 커밋 자동화 명령 |
| `gitlab` | claude-plugins-official | 〃 | GitLab 연동 |
| `agent-sdk-dev` | claude-plugins-official | 〃 | Agent SDK 앱 검증 |
| `frontend-design` | claude-plugins-official | 〃 | 프런트엔드 디자인 |
| `figma` | claude-plugins-official | 〃 | Figma 연동 (MCP) |

> 플러그인 **소스/캐시(165MB)** 는 추적하지 않고 매니페스트 json 만 공유한다. 새 맥에서는 각 마켓플레이스를 추가 후 재설치한다.

## 🪝 Hooks

`hooks/` — Claude Code 훅 스크립트.

| 훅 | 설명 |
|---|---|
| `session-start.mjs` | 세션 시작 시 컨텍스트/상태 주입 |
| `pre-tool-use.mjs` · `post-tool-use.mjs` | 도구 사용 전/후 처리 |
| `post-tool-use-failure.mjs` | 도구 실패 시 후처리 |
| `block-dangerous.sh` · `block-git-push.sh` | 위험 명령 / git push 차단 |
| `auto-format.sh` · `type-check.sh` | 저장 후 자동 포맷 / 타입 체크 |
| `scripts/sync-skills.sh` (Stop 훅) | 세션 종료 시 로컬 `~/.claude/skills` 변경을 이 repo 로 자동 동기화 (변경 있을 때만 commit+push, `.env`/`node_modules`/깨진 symlink 제외) |
| `context-engineering.sh` · `handoff-on-failure.sh` | 컨텍스트 엔지니어링 / 실패 핸드오프 |
| `keyword-detector.mjs` · `persistent-mode.mjs` · `code-simplifier.mjs` | 키워드 감지 / 지속 모드 / 코드 단순화 |

## ⚙️ 전역 설정

- `CLAUDE.md` — 전역 지침(모델 라우팅 · 토큰 절약 · MCP 자동 사용 규칙 등)
- `settings.json` — 권한 / 모델 / 훅 / statusline 설정
- `mcp_servers.example.json` — MCP 서버 설정 예시. **실제 `mcp_servers.json`(API 키 포함)은 `.gitignore` 로 제외.** 사용 시 복사 후 `FIGMA_API_KEY` 등 본인 키 입력.

## 🚀 새 맥에 적용

### 옵션 A. 복사 (단발성)

```bash
git clone git@github.com:Roy-wonji/claude-config.git ~/claude-config
cp -R ~/claude-config/agents/. ~/.claude/agents/
cp -R ~/claude-config/skills/.  ~/.claude/skills/
```

### 옵션 B. 심볼릭 링크 (자동 동기화 권장)

```bash
git clone git@github.com:Roy-wonji/claude-config.git ~/claude-config
mv ~/.claude/agents ~/.claude/agents.bak 2>/dev/null
mv ~/.claude/skills ~/.claude/skills.bak 2>/dev/null
ln -sfn ~/claude-config/agents ~/.claude/agents
ln -sfn ~/claude-config/skills ~/.claude/skills
```

### 업데이트

```bash
cd ~/claude-config && git pull
```

## 🤖 에이전트 카탈로그

### 🔍 `@code-reviewer`
**10년차 시니어 Swift / iOS 개발자** 관점의 **읽기 전용** 코드 리뷰어.
- Write/Edit 도구 미사용 — 의견만 출력
- 심각도 표기: `[심각도: 상/중/하] 파일:라인 — 설명`
- 관점: 로직 결함, SOLID 위반, 성능, 보안, 네이밍, 테스트 누락, **불필요한 주석(이름 재진술 자명 주석)**, **TCA Effect 누수 / retain cycle / @MainActor 격리**

### 🧪 `@test-engineer`
Swift Testing 기반 테스트 작성 전문 (TDD Red 단계).
- 프레임워크: **Swift Testing** (`@Test`, `#expect`, `@Suite`)
- 외부 의존성은 Protocol Mock 또는 **WeaveDI Mock / TCA TestStore** 사용
- 메서드명: `test_기능_조건_기대결과`, 구조: Given-When-Then

### 🛠 `@code-simplifier`
TDD Refactor 단계 — 기능 변경 없이 구조만 개선.
- 테스트가 모두 통과해야 함
- 불필요한 추상화/주석/유틸리티 추가 금지

### 🤖 `@test-auto-pr-agent`
Swift Testing 기반 **도메인별 완전 자동 테스트 생성 + PR 자동 생성 파이프라인**.
- `docs/agent/` 의 도메인 분석 → 테스트 코드 자동 생성 → 실행 → 실패 시 자동 수정
- TCA TestStore / WeaveDI Mock 자동 설정
- 성공 시 PR 자동 생성

## 📚 docs/agent — iOS 프로젝트용 가이드 템플릿

신규 iOS 프로젝트(TCA + Clean Architecture + Tuist)에 그대로 떠다 쓰거나 일부만 발췌해 사용한다.
대표 문서:

| 문서 | 내용 |
|---|---|
| `tca-patterns.md` | TCA Reducer / Action / State 작성 규칙, Coordinator Extension 패턴 |
| `swiftui-patterns.md` | View Extension, Computed Properties + `@ViewBuilder`, Skeleton 패턴 |
| `swift-coding-rules.md` | Swift 스타일, 에러 처리, TCA 에러 처리 규칙 |
| `popup-modal-system.md` | CustomAlert / Toast / CustomModal (TCA Presentation) |
| `dependency-injection.md` | WeaveDI 3.4.1 + AppDIManager + TCA Dependencies 통합 |
| `tcaflow-navigation.md` | `@FlowCoordinator` 네비게이션 패턴 |
| `ios-performance-*.md` | TCA / SwiftUI / 빌드 성능 최적화 가이드 (PFW 포함) |
| `git-workflow.md` | 브랜치 전략, 커밋/PR/리뷰 가이드라인 |
| `development-environment.md` | Tuist / Make / xcconfig / 테스트 명령어 |

> 프로젝트에 적용할 때는 `docs/agent/` 를 그대로 복사하고, 루트 `AGENTS.md` 에서 이 폴더의 문서들을 링크로 참조하면 된다.

## 🧰 스킬 카탈로그

### 🔁 `/tdd`
TDD 파이프라인 자동화: **Plan → Red → Green → Review → Refactor → Commit**
- Plan: `EnterPlanMode` 진입 후 사용자 확인
- Red: `@test-engineer` 스폰, `xcodebuild test` 또는 `tuist test` 로 실패 확인
- Green: 최소 구현 후 재검증
- Review: `@code-reviewer` 스폰, 심각도 '상' 항목은 사용자 확인
- Refactor: `@code-simplifier` 스폰 후 테스트 재실행
- Commit: `/commit` 호출

### 📝 `/commit`
SRP 기반 커밋 플래너.
- `git status` / `git diff` 병렬 수집
- 변경을 단일 책임 단위로 분리한 **커밋 플랜** 제시 후 사용자 승인 시 순차 커밋
- `git add -A`/`.` 금지, 파일 명시적 지정
- Conventional Commits 형식 (`feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `style`)

### 🎨 `figma-pencil-ui-fallback`
Figma 디자인 → UI 구현 시 **Figma MCP 한도(rate limit/quota/429) 도달하면 Pencil MCP 로 자동 전환**.
- 마지막 Figma 스크린샷/토큰을 레퍼런스로 고정
- Pencil 로 동일 디자인을 `.pen` 에 복제(픽셀/레이아웃 일치) 후 대조 보정
- `.pen` 수치를 읽어 대상 프레임워크 UI 코드로 변환 + 시각 일치 검증

### 🧠 `thought-based-reasoning`
복잡한 추론(CoT, Self-Consistency, Tree of Thoughts, ReAct 등) 가이드. 출처: NeoLabHQ/context-engineering-kit.

### 📱 `ios-simulator-skill`
iOS 시뮬레이터 자동화 스크립트 모음(빌드/UI 네비게이션/접근성). 출처: conorluddy/ios-simulator-skill (MIT).

### 🏛️ `fable-grade`
모델 등급(Haiku/Sonnet/Opus) 무관하게 **Fable-5급 시니어 산출물**을 강제하는 작업 프로토콜. 아키텍처 설계·멀티파일 리팩터·마이그레이션·근인 디버깅에 발동. 8기둥(근거 우선 `파일:라인`·규약 추출·근인 1문장·현실 규모 단순화·트레이드오프 표면화·검증 가능한 마이그레이션·하드 제약 존중)을 체크리스트로 밟는다. iOS/Tuist 워크드 레퍼런스(xcconfig base+#include 상속, 단일 타깃+다중 config, 워크스페이스 config 일관성, 중나식 레이어드 모듈) 포함.

### 📦 전체 스킬 인벤토리 (54개)
agent-council,app-store-changelog apple-design-system,apple-skills clean-architecture,commit fable-grade,figma-pencil-ui-fallback,ios-accessibility ios-debugger-agent,ios-performance ios-performance-optimizer,ios-performance-pfw ios-performance-uikit-guide,ios-simulator ios-simulator-skill,ios-uikit-expert pfw-case-paths,pfw-composable-architecture pfw-custom-dump,pfw-dependencies pfw-identified-collections,pfw-issue-reporting pfw-macro-testing,pfw-modern-swiftui pfw-observable-models,pfw-perception pfw-pfw,pfw-sharing pfw-snapshot-testing,pfw-spm pfw-sqlite-data,pfw-structured-queries pfw-swift-navigation,pfw-testing reactorkit-expert,rxswift-expert skill-creator,swift-api-design-guidelines swift-concurrency,swift-concurrency-pro swift-ios-skills,swift-security-expert swift-testing-pro,swiftdata-pro swiftui-auditor,swiftui-liquid-glass swiftui-pro,swiftui-ui-patterns swiftui-uikit-interop,swiftui-view-refactor tca-optimizer,tdd thought-based-reasoning

> 로컬 `~/.claude/skills` 변경은 `scripts/sync-skills.sh` (Stop 훅)로 자동 동기화됨.

## 🧩 플러그인 마켓플레이스
이 repo 는 `.claude-plugin/marketplace.json` 으로 **마켓플레이스** 역할도 한다.

| 플러그인 | 설명 |
|---|---|
| `apple-skills` | rshankras/claude-code-apple-skills(MIT) 143개 Apple/Swift 스킬. 카테고리 23개: app-store, apple-intelligence, core-ml, design, foundation, generators, growth, ios, legal, macos, mapkit, monetization, performance, product, release-review, security, shared, swift, swiftdata, swiftui, testing, visionos, watchos |

설치:
```bash
claude plugin marketplace add Roy-wonji/claude-config
claude plugin install apple-skills@roy-claude-config
```

## ✅ 커밋 메시지 규칙

- **모든 커밋 메시지는 한국어로 작성**
- 영문 타입 prefix(`feat`, `fix` 등)는 허용, 설명 문구는 한국어
- `Co-Authored-By: Claude ...` 같은 자동 서명 라인 **절대 추가 금지**
- 민감 파일(`.env`, 자격 증명) 커밋 금지

## 🏗 하네스 팀 (harness-100 + revfactory) — 작업 매칭 시 자동 호출

명령어 없이도 작업 성격에 맞으면 **자동으로** 해당 팀/스킬이 붙는다 (CLAUDE.md 「자동 하네스·팀 적용」 규칙).

| 팀 / 스킬 | 자동 트리거 작업 | 구성 |
|---|---|---|
| `harness` (revfactory) | 새 도메인 자동화 체계·역할 분해 작업 → **항상 우선 검토** | 팀 아키텍처 팩토리(6패턴) |
| `code-reviewer` | 코드 리뷰·PR 검토 | 스타일→보안→성능→아키텍처 5인 |
| `test-automation` | 테스트 작성·커버리지·CI 테스트 | 전략·단위·통합·커버리지·QA |
| `cicd-pipeline` | CI/CD·배포 파이프라인 | 설계·인프라·보안스캔·모니터링 |
| `legacy-modernizer` | 레거시 리팩터·마이그레이션 | 분석·전략·마이그레이션·회귀 |
| `mobile-app-builder` | 모바일 앱 개발·UX·API·스토어 | app-developer·ux-designer·api-integrator·qa-engineer·store-manager |
| `karpathy-guidelines` | **모든 코드 작업 상시** | 4원칙(Think/Simplicity/Surgical/Goal) |

출처: [revfactory/harness](https://github.com/revfactory/harness), [revfactory/harness-100](https://github.com/revfactory/harness-100), [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills)

## 🔁 작업 완료 후 이중 리뷰 게이트 (Claude + Codex)

모든 코드 작업을 끝내면 완료를 보고하기 **전에**, 아래 두 리뷰를 **로컬에서 둘 다** 실행한다 (하나만 돌리지 않는다).

1. **Claude 심층 리뷰** — `@code-reviewer`(필요 시 architecture/style/performance 병렬). 구현 컨텍스트가 아닌 **별도 레인**으로 (자기승인 금지).
2. **Codex 심층 리뷰** — `codex exec ... sandbox_mode=read-only`(또는 `/codex:review`, 강한 반증은 `/codex:adversarial-review`).

- 두 리뷰는 독립 레인으로 **교차 대조**한다.
- 지적은 맹목 적용 금지 — **오탐 여부를 판단**해 유효한 것만 surgical 하게 반영 후 재검증(빌드/테스트). 반영/보류 사유를 한 줄씩 보고.
- Codex 실행 불가 시 `/codex:setup` 시도, 그래도 안 되면 Claude 리뷰만 하고 **건너뛴 사실을 고지**.
- 사소한 1줄 수정(타이포·주석)은 생략 가능.

## ✍️ 주석 원칙

- **불필요한 주석을 쓰지 않는다.** 이름·코드를 그대로 재진술하는 자명한 주석 금지.
- 비자명한 **의도·트레이드오프·근거(왜 이렇게 했는지)**를 담은 꼭 필요한 주석만 남긴다.
- `@code-reviewer`·`@code-simplifier`가 자명한 주석을 지적·제거한다.

## 🔔 자동 호출 키워드 (참고)

iOS 프로젝트에서 다음 키워드 등장 시 성능/아키텍처 스킬 자동 호출:

- `ifCaseLet`, `TCA`, `Effect`, `메모리 누수`, `성능`, `최적화`
- `SwiftUI`, `렌더링`, `빌드 시간`, `TCAFlow`, `WeaveDI`
- `Cannot infer`, `Extensions must not`, `Type annotation missing`
- `빌드 오류`, `컴파일 에러`, `SourceKit error`

## 🧷 라이선스 / 사용

개인 설정 공유용 저장소. 자유롭게 fork 후 본인 환경에 맞게 수정해 사용하면 된다.
