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
├── agents/                  # 사용자 정의 에이전트
│   ├── code-reviewer.md     # 시니어 Swift 관점 리뷰어 (read-only)
│   ├── code-simplifier.md   # 기능 변경 없는 리팩터링 전문
│   └── test-engineer.md     # Swift Testing 기반 테스트 작성
└── skills/                  # 사용자 정의 스킬
    ├── commit/SKILL.md      # SRP 기반 커밋 플래너
    └── tdd/SKILL.md         # Plan → Red → Green → Review → Refactor → Commit
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
시니어 Swift 개발자 관점의 **읽기 전용** 코드 리뷰어.
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
