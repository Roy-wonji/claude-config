# quality-gate — 정적 품질 게이트

편집된 Swift 파일의 **변경분**을 아래 기준으로 정적 검사한다 (빌드·테스트 없음).
**1번부터 순서대로** 검사하고, **명확한 위반만** 지적한다. 경미하거나 불확실하면 통과시켜
과잉 차단을 피한다.

> 이 문서가 게이트 프롬프트의 단일 소스다. 기준을 바꾸려면 이 파일만 수정하면 된다.
> `quality-gate.sh` 가 이 내용을 읽어 변경분을 덧붙여 판정 모델에 보낸다.

## 검사 단계

### 1. 코드 안정성
런타임 크래시·미정의 동작을 유발할 수 있는 패턴.

- 강제 언래핑(`!`), `as!` 강제 캐스팅, `try!` — 안전한 대안(옵셔널 바인딩·`guard`·`try?`)이 있는데 쓴 경우
- 배열 인덱스 직접 접근 등 범위 초과 가능성
- 프로덕션 코드의 `fatalError`·`preconditionFailure` 남용
- 명백한 동시성 위험 — `@MainActor` 격리 위반, 비-`Sendable` 캡처, actor 외부에서의 가변 상태 접근
- 메모리 위험 — 클로저의 강한 순환참조(`[weak self]`/`[unowned self]` 누락), 델리게이트 `strong` 보유

### 2. 모듈 의존성
프로젝트 Dependency Rules 위반. (기준: `README.md` 의 *Dependency Rules*)

- 피처가 다른 피처/Core/Service의 **구현 모듈을 직접 import** — `Interface` 에만 의존해야 함
- 구현(`.implementation`) 직접 참조 — App 조립 레이어 외에서 사용
- 의존 방향 역행 — 저수준(Core)이 상위(Feature/App)를 import
- 카탈로그에 선언되지 않은 의존 추가

### 3. 구조
레이어·책임 경계 위반.

- 레이어 경계 위반 — Core 가 Feature 를, Service 가 App 을 참조하는 등
- 화면 **조합·전환**을 모듈 내부에서 처리 — 이는 App 의 Composition/Coordinator 책임
- Domain 레이어가 외부(네트워크·UI·Foundation 외)에 의존
- 한 타입/파일이 명백히 여러 책임을 떠안음

### 4. 접근제어자
공개 표면(public surface)의 부적절한 노출/누락.

- 모듈 외부에서 써야 하는데 `public`/`open` 이 아님 (`Interface` 공개 API)
- 내부 구현 디테일이 불필요하게 `public` 으로 노출
- `Interface` 에 구현 세부(구체 타입·내부 의존)가 새어 나옴
- 기본 접근 수준으로 충분한데 과도하게 넓힘

## 출력 형식

아래 JSON 만 출력한다. `steps` 에는 위 **"검사 단계"의 각 항목을 그 순서대로** 하나씩 넣는다 —
`name` 은 단계 제목, `pass` 는 통과 여부(true/false). 단계가 추가·삭제·변경되면 그에 맞춰 `steps` 도 늘리거나 줄인다(개수·이름 고정 아님).
`violations` 는 위반이 있을 때만 넣고(없으면 빈 배열), `rule` 은 해당 단계 제목으로 적는다.

```json
{
  "steps": [
    {"name": "<검사 단계 제목>", "pass": true}
  ],
  "violations": [
    {"rule": "<검사 단계 제목>", "line": 번호, "fix": "수정 지시"}
  ]
}
```

JSON 외 다른 텍스트는 출력하지 않는다.

## 다룰 수 없는 것

컴파일이 필요한 검증(전체 빌드 안정성, Swift 6 strict concurrency 등)은 정적 범위 밖이다.
그건 Stop 단계의 `make test`(빌드 포함)가 담당한다.
