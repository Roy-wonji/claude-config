---
name: fable-grade
description: "모델 등급(Haiku/Sonnet/Opus)과 무관하게 Fable-5급 시니어 산출물을 만드는 작업 프로토콜. 아키텍처 설계·멀티파일 리팩터·마이그레이션·구조 재설계·근인 디버깅에 사용한다. '설계', '아키텍처', '리팩터', '마이그레이션', '구조 재설계', '모듈 분리', '왜 이렇게 동작', 'Tuist', 'xcconfig' 등에서 자동 발동. 핵심: 근거 우선(file:line 인용, 추측 금지)·규약 추출·현실 규모에 맞춘 단순화·트레이드오프 표면화·검증 가능한 마이그레이션·하드 제약 존중. 단순 1~2 step 자명 작업엔 쓰지 않는다."
---

# fable-grade — 시니어 산출물 프로토콜

이 스킬은 **어떤 모델이든** Fable-5급(시니어 아키텍트) 결과를 내도록 강제하는 작업 규율이다.
"똑똑한 모델"이 아니라 **규율**이 품질을 만든다. 아래 8개 품질 기둥과 실행 프로토콜을 그대로 따른다.

karpathy 4원칙(Think Before Coding / Simplicity First / Surgical Changes / Goal-Driven Execution)의 상위 실행 버전이다.

---

## 1. 품질 8기둥 (산출물이 반드시 만족해야 하는 것)

1. **근거 우선 (Evidence-first)** — 모든 주장에 `파일:라인` 근거를 붙인다. 파일을 실제로 읽기 전에 구조·동작을 단정하지 않는다. **추측 금지.** 모르면 "확인 필요"로 남긴다.
2. **규약 추출 (Convention extraction)** — 레퍼런스/기존 코드에서 암묵 규칙을 **명시적 규약(R1, R2…)** 으로 역추적한다. "이렇게 하는 것 같다"가 아니라 "헬퍼 X의 기본 인자가 `.interface` → 규칙: 의존은 기본이 인터페이스"처럼 근거와 함께 규칙화한다.
3. **현행 갭 진단 (Gap, not vibes)** — 현재 상태와 목표 사이 격차를 **구체적 위반 사례**로 나열한다. "구조가 안 좋다"(x) → "Domain→Data 역방향 의존(`DomainInterface/Project.swift:15`)"(o).
4. **근인 (Root cause, not symptom)** — 증상을 때우지 말고 **한 문장의 근본 원인**을 찾는다. 예: "모듈은 많은데 경계 규약이 없다 → 의존 DSL에 방향 검증이 없어 역엣지가 축적됨."
5. **현실 규모에 맞춘 단순화 (Right-sizing)** — 레퍼런스를 맹목 복제하지 않는다. 대상의 실제 규모(파일 수·인원·도메인)를 측정하고 거기에 맞춘다. 불필요한 추상화·타깃 폭발을 만들지 않는다.
6. **트레이드오프 표면화 (Tradeoffs surfaced)** — 결정 지점마다 A/B안 + **권고 + 이유**를 제시한다. 숨은 비용(빌드시간·유지비·리스크)을 드러낸다. 가정은 "**가정 명시:** …"로 박아둔다.
7. **검증 가능한 마이그레이션 (Verifiable steps)** — 실행 계획은 **리스크 오름차순 단계**로 쪼개고, 각 단계에 **검증 가능한 성공 기준**(빌드 통과/테스트 N개/그래프에 위반 0건)을 붙인다. 명령형 나열이 아니라 "이 상태가 되면 성공"을 정의한다.
8. **하드 제약 존중 (Honor hard constraints)** — CI 스킴명, 파일 경로, 배포 파이프라인, 외부 계약 등 **바꾸면 깨지는 것**을 먼저 식별하고 전 단계에서 불변으로 유지한다. 어기면 반드시 사전에 알린다.

---

## 2. 실행 프로토콜 (순서 고정)

설계/리팩터/마이그레이션 요청을 받으면:

1. **범위·제약 스캔** — 손대면 깨지는 하드 제약부터 찾는다.
   - CI: `grep`으로 `bitrise.yml`·`fastlane/Fastfile`이 참조하는 스킴명·config·파일경로
   - gitignore 여부(`git check-ignore`), 시크릿 주입 방식, 외부에서 파일명으로 참조하는지
   - 이걸 모르고 파일명·구조를 바꾸면 CI가 조용히 깨진다.
2. **레퍼런스 규약 추출** — 참조 프로젝트가 있으면 그 **헬퍼/템플릿 코드**를 읽어 규칙(R1…)으로 정리. 그림(graph.png)만 보지 말고 코드로 역추적한다.
3. **현행 근거 수집** — 대상의 모듈/의존/설정 파일을 실제로 읽고, 규모를 센다(`find … | wc -l`). 갭을 `파일:라인`으로 기록.
4. **근인 1문장** 도출.
5. **목표 설계** — 규약을 대상 도메인에 매핑. 현실 규모에 맞춰 축소/확장 결정. 네이밍 충돌 같은 기술적 하드 제약 반영.
6. **현행→목표 매핑 표** — 각 요소를 유지/이름변경/분리/신설/통합/삭제로 분류.
7. **목표 그래프** — mermaid/graphviz로 레이어 배치.
8. **마이그레이션 단계** — 리스크 오름차순 + 단계별 성공 기준 + 전 단계 CI 제약 준수 명시.
9. **트레이드오프/오픈 이슈** — 결정 필요 지점을 남긴다. 큰 변경은 **구현 전 승인 게이트**를 둔다(청사진 먼저).

각 단계 산출은 한국어. 표는 간결하게. 근거 없는 문장은 쓰지 않는다.

---

## 3. 워크드 레퍼런스 — iOS / Tuist 모듈 아키텍처

아래는 실제 프로젝트(DDDAttendance ↔ 중고나라)에서 검증된 구체 지식이다. iOS/Tuist 작업 시 그대로 참고한다.

### 3-1. xcconfig — base + #include 상속 (단일 타깃, 다중 config)
- `Config/base.xcconfig`에 **공통 빌드/버전/경고억제**만 둔다. 각 환경(Dev/Stage/Prod/Release)은 `#include "base.xcconfig"` 후 **환경 전용 값**(BASE_URL·OAuth·표시이름)만 override.
- **함정**: `Config/`가 `.gitignore`면 실제 xcconfig는 CI가 시크릿에서 주입(`cp /tmp/cfg/Config/*.xcconfig Config/`)한다. → **파일명·include를 바꾸면 시크릿 번들도 같이 바꿔야** CI가 안 깨진다. 커밋 전에 `git check-ignore` 확인.

### 3-2. 단일 타깃 + 다중 config (안티패턴: 타깃 복제)
- 환경 분기를 **타깃 복제**(App, App-Debug, App-Stage, App-Prod)로 하면 name만 다른 중복 타깃이 생긴다 → **안티패턴.**
- 올바른 형태: **타깃 1개 + config N개**. 환경은 "스킴이 어떤 config로 빌드하느냐"로만 결정. 스킴명은 CI(fastlane `STAGE_SCHEME`/`PROD_SCHEME`)가 참조하므로 **이름을 보존**하면 CI 무변경으로 리팩터 가능.

### 3-3. 워크스페이스 config 일관성 (필수)
- **모든 프로젝트가 동일한 config 집합**(이름·타입 debug/release)을 가져야 한다. App만 4 config(Debug/Stage/Prod/Release)이고 모듈은 Debug/Release 2개면, Stage/Prod config로 빌드 시 모듈의 **패키지 의존성이 그 config에서 해석되지 않아** `Unable to find module dependency`로 깨진다.
- 해결: 표준 config 배열을 한 곳에 정의(`moduleDefault`)하고 전 모듈 `Project.swift`가 공유(`settings: .moduleSettings`). 새 모듈 추가 시 반드시 지정.
- 검증: `tuist generate` 로그에 `missing or mismatching configurations` 경고 **0개** = 정합.

### 3-4. 중나식 레이어드 모듈 규약
- **단일 진입점** `Project.configure(moduleType:product:dependencies:)`. ModuleType 5종(`.app/.feature/.core/.service/.module`).
- **Interface 역전**: 의존 DSL 기본값이 `.interface`. **구현(`.implementation`) 연결은 엄브렐러(Features)와 App에서만.** → 피처 간 구현 직접 의존을 구조적으로 차단.
- **타깃 규약**: Feature = Interface + 구현 + Testing(Mock 격리) + Tests + Demo(옵션). Service = Interface(필수) + 구현 + Tests. Core = 구현(+Interface 옵션).
- **레이어 단방향**: App → Features → (ServiceInterface, DesignKit) / Service → CoreInterface / Core → 외부(Alamofire→CFNetwork). 역방향 엣지 = 위반.
- **카탈로그 단일 출처**: 모듈 추가 = enum case 한 줄. 죽은 case·중복 import는 오염이므로 정리.

---

## 4. 디버깅 규율 (근인 추적)

- **환경 오류 vs 코드 오류를 먼저 구분한다.** 예: `database is locked / two concurrent builds`(동시성), `sdkstatcache not found`(DerivedData 손상) → **코드 결함 아님.** 코드를 고치지 말고 환경을 정리한다.
- **자가 유발 인지**: 빌드를 kill하거나 lock/DerivedData를 지운 뒤 나는 에러는 내가 만든 것일 수 있다. 원인을 코드로 오귀속하지 않는다.
- **동일 가설 재시도 금지.** 실패하면 시도/이유/다음 방향을 기록하고 **가설을 바꾼다.** (툴 타임아웃으로 안 끝난 것과 실제 실패를 구분.)
- **검증은 CI가 실제 쓰는 경로로.** fastlane이 `configuration: "Release"`를 강제하면, 로컬 검증도 그 config로 한다.

---

## 5. 안티패턴 (하지 말 것)

- 파일을 읽지 않고 구조를 단정한다 (근거 없는 주장).
- 레퍼런스를 규모 무시하고 통째 복제 → 타깃 폭발·불필요 추상화.
- 증상만 때운다 (근인 미도출).
- 하드 제약(스킴명·경로·CI)을 조용히 어기고 "완료" 보고.
- 큰 구조 변경을 승인 없이 바로 실행 → 청사진·트레이드오프 없이 진행.
- 트레이드오프·가정을 숨긴다.
- 검증 없이 완료를 주장한다.

> 이 스킬을 발동하면 위 프로토콜을 체크리스트로 만들어 하나씩 밟는다. 각 산출에 근거를 붙이고, 완료 전 성공 기준 충족을 증거로 확인한다.
