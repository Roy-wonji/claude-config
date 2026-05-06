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
- 관점: 로직 결함, SOLID 위반, 성능, 보안, 네이밍, 테스트 누락, **TCA Effect 누수 / retain cycle / @MainActor 격리**

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

## ✅ 커밋 메시지 규칙

- **모든 커밋 메시지는 한국어로 작성**
- 영문 타입 prefix(`feat`, `fix` 등)는 허용, 설명 문구는 한국어
- `Co-Authored-By: Claude ...` 같은 자동 서명 라인 **절대 추가 금지**
- 민감 파일(`.env`, 자격 증명) 커밋 금지

## 🔔 자동 호출 키워드 (참고)

iOS 프로젝트에서 다음 키워드 등장 시 성능/아키텍처 스킬 자동 호출:

- `ifCaseLet`, `TCA`, `Effect`, `메모리 누수`, `성능`, `최적화`
- `SwiftUI`, `렌더링`, `빌드 시간`, `TCAFlow`, `WeaveDI`
- `Cannot infer`, `Extensions must not`, `Type annotation missing`
- `빌드 오류`, `컴파일 에러`, `SourceKit error`

## 🧷 라이선스 / 사용

개인 설정 공유용 저장소. 자유롭게 fork 후 본인 환경에 맞게 수정해 사용하면 된다.
