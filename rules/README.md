# Rules

규칙은 **공통 레이어 + 플랫폼별 디렉토리**로 구성된다.

```
rules/
├── common/                  # 플랫폼 무관 규칙 (전 플랫폼 적용)
│   └── git-conventions.md   #   브랜치·커밋·머지
├── ios/                     # iOS 전용
│   └── quality-gate.md      #   Swift 정적 품질 게이트 기준
└── android/                 # Android 전용
    └── quality-gate.md      #   Kotlin 기준 (TODO — 없으면 게이트 graceful-skip)
```

- `common/` 은 언어·플랫폼에 의존하지 않는 규칙만 둔다 (코드 예시 없음).
- 플랫폼 디렉토리는 그 플랫폼의 검사 기준·도구·코드 예시를 담는다.

## 어떻게 적용되나

이 레포는 **Claude Code 플러그인**이다. 규칙은 플랫폼별로 선택 적용된다.

- **품질 게이트 규칙** — `hooks/quality-gate.sh` 가 `app-harness.config.json` 의 `platform` 값으로
  `rules/<platform>/quality-gate.md` 를 읽어 판정한다. (ios → `rules/ios/quality-gate.md`)
  해당 파일이 없으면 게이트는 자동 통과(no-op)한다.
- **공통 규칙** — `rules/common/git-conventions.md` 는 사람이 읽는 전체 참조. 운영에 필요한 핵심
  (base 브랜치·squash 등)은 스킬에 인라인으로 들어가 있어, 이 파일 없이도 워크플로우는 동작한다.

## Rules vs Skills

- **Rules** (`rules/`) — 지켜야 할 기준·컨벤션·체크리스트. "무엇을" 지키는가.
- **Skills** (`skills/`) — 특정 작업의 실행 가이드. "어떻게" 하는가. (tdd, swiftui 등)

## 우선순위

플랫폼 규칙과 공통 규칙이 충돌하면 **플랫폼 규칙이 우선**한다 (구체가 일반을 덮는다 — CSS 명시도와 같은 패턴).
`common/` 은 보편 기본값을 정의하고, 플랫폼 디렉토리는 그 언어 관용이 다른 지점을 덮어쓴다.
