---
name: tuist-microfeature-migration
description: "Tuist + TCA 프로젝트의 Domain/Data 레이어를 Presentation 처럼 feature별 마이크로 모듈로 재편하는 실전 플레이북. 레이어 단일 모듈(Entity/UseCase/DomainInterface/API/Model/Service/Repository)을 <Feature>Domain(Interface/구현/Testing 4타깃)·<Feature>Data(단일 타깃)로 분리. 공유 타입 Common 승격, 네트워크 인프라 브리지, 엄브렐라·DI 배선, worktree 병렬화, 매 feature 빌드 그린 검증."
---

# Tuist Microfeature Migration — Domain/Data feature 모듈화

> Presentation 은 이미 feature별 모듈인데 Domain/Data 는 레이어 단일 모듈인 프로젝트를,
> **매 단계 빌드 그린을 유지하며** feature별 마이크로 모듈로 재편하는 검증된 절차.
> 반드시 `elevated-execution` 스킬(실행 규율)과 함께 사용.

## 목표 토폴로지 (권장안)
- **Domain feature** = `Projects/Domain/<Feature>/` 1 xcodeproj, `.microModule(name:"<Feature>Domain")` → 4타깃:
  `<Feature>DomainInterface`(Entity+프로토콜) / `<Feature>Domain`(UseCase 구현) / `<Feature>DomainTesting` / Tests.
  물리 폴더는 정확히 `Interface/`, `Sources/`, `Testing/`, `Tests/` (buildableFolders).
- **Data feature** = `Projects/Data/<Feature>/` 1 xcodeproj, `.module(name:"<Feature>Data")` 단일 타깃,
  `Sources/` 안에 API/Model/Service/Repository 를 폴더로 내장(`sources:["Sources/**"]`).
  이유: 한 feature 안의 API↔Service↔Repository 는 항상 같이 바뀌어 타깃 분리 실익이 없다.
- **엄브렐라**(`Domain`/`Data`)는 유지하되 **App(DI 조립) 전용**. Presentation/Data 는 자기 feature 만 개별 참조.

## 스캐폴드(접근자) — 한 번만 추가, 재사용
`DependencyPlugin` 에 feature 접근자 1개 파일만 둔다(중복 정의 절대 금지):
```swift
public enum DomainFeatureModule: String, CaseIterable { case Auth, Battle, Comment, Home, Notification, Perspective, Profile, Search, Common }
public enum DataFeatureModule: String, CaseIterable { /* 동일 */ }
public enum FeatureTargetKind { case interface, implementation, testing }
public extension ProjectDescription.Path {
  static func DomainFeature(_ m: DomainFeatureModule) -> Self { .relativeToRoot("Projects/Domain/\(m.rawValue)") }
  static func DataFeature(_ m: DataFeatureModule) -> Self { .relativeToRoot("Projects/Data/\(m.rawValue)") }
}
public extension TargetDependency {
  static func Domain(_ m: DomainFeatureModule, _ k: FeatureTargetKind = .implementation) -> Self {
    let s = k == .interface ? "DomainInterface" : k == .testing ? "DomainTesting" : "Domain"
    return .project(target: "\(m.rawValue)\(s)", path: .DomainFeature(m))
  }
  static func Data(_ m: DataFeatureModule) -> Self { .project(target: "\(m.rawValue)Data", path: .DataFeature(m)) }
}
```
> `.microModule` ModuleType 이 `configureFeature`(4타깃)로 위임되는지 먼저 확인. 없으면 그 경로부터 연결.
> **병렬 에이전트가 각자 접근자를 새로 만들면 중복 enum 으로 깨진다.** 스캐폴드는 먼저 커밋·푸시하고 재사용.

## 순서 (커플링 먼저)
1. **0단계 스캔.** feature 간 교차 참조 타입을 grep 으로 매핑. 순환쌍(예: Battle↔Perspective) 식별.
2. **Foundations/공유 분할.** 범용 이름의 잡동사니 모듈은 역할별로 쪼갠다(예: `Foundations`→`NetworkToken`+`NetworkHeader`).
3. **파일럿 1개(고립 feature).** 교차참조 없는 feature(예: Notification/Search/Profile) 하나로 전 절차 검증 → 게이트.
4. **Common 승격.** 순환 유발 공유 타입(관점/댓글 결과/공유 태그 등)을 `CommonDomainInterface` 로 먼저 승격·커밋·**푸시**.
   이름 충돌(같은 `BattleStep` 2개)은 한쪽 리네임(`AnalyticsBattleStep`).
5. **나머지 병렬.** Common 이 준비되면 결합 feature(Battle/Comment/Perspective/Home)도 독립이 되어 병렬 가능.
6. **Auth+OAuth 는 병합.** 공유 세션 타입이 많아 쪼개기보다 하나(`AuthDomain`)로 흡수. `googleSignIn` 은 `AuthData` 로 국소화.

## feature 1개 이동 체크리스트
- [ ] `git mv` 로 이동(히스토리 보존): Entity+DomainInterface→`Interface/`, UseCase→`Sources/`, DomainTesting→`Testing/`;
      API/Model/Service/Repository→`Data/<F>/Sources/`.
- [ ] import 교정: 같은 모듈 된 타입 import 제거, 타 feature 타입은 그 Interface/`CommonDomainInterface`, `Model`(BaseResponseDTO) 유지.
- [ ] **공유 DTO 는 monolith Model 에 남긴다**(여러 feature Data 가 참조 → 옮기면 순환). `<F>Data` 는 `import Model`.
- [ ] **네트워크 인프라 브리지**: `MoyaProvider.authorized`·세션매니저는 monolith `Repository` 에 유지,
      `<F>Data` 는 `.Data(implements:.Repository)` + `import Repository`. 크로스모듈 참조되는 심볼은 `public` 승격.
- [ ] 소비자 배선: `Presentation/<F>/Project.swift` 에 `.Domain(.<F>)`, 소비 파일에 `import <F>Domain`(DI 키) + `import <F>DomainInterface`(타입).
- [ ] 엄브렐라: `Domain/Domain`·`Data/Data` 의 Exported 에 `@_exported import <F>Domain/...`, Project.swift dep 추가.
- [ ] `App/Di/DiRegister.swift` 등록 import 교정.
- [ ] **빌드 그린 검증** 후에만 커밋. 통합 병합 후 통합 빌드 1회 더.

## 검증 커맨드(고정)
```
tuist install && tuist generate --no-open && \
xcodebuild -workspace <App>.xcworkspace -scheme <Scheme> \
  -destination 'platform=iOS Simulator,id=<UDID>' ONLY_ACTIVE_ARCH=YES \
  -derivedDataPath .build/dd build 2>&1 | grep -E "BUILD (SUCCEEDED|FAILED)|error:" | tail -30
```
- `Internal Error: DecodingError.dataCorrupted`(Tuist JSON 캐시) 2줄은 **무해 노이즈**. 무시.
- worktree 엔 gitignore 된 `Config/*.xcconfig` 가 없어 generate 가 조용히 실패 → 메인에서 복사 먼저.
- 빌드 실패의 대부분은 **에러 파일에 import 한 줄 추가**로 해결(타입=Interface/Common/Entity, DI 키=구현 모듈).

## 완료 판정
- 전 feature 가 `<F>Domain`/`<F>Data` 로 분리되고 App 빌드 그린.
- `tuist graph --skip-external-dependencies --skip-test-targets` 로 순환 0, Presentation→Data 직접 에지 0 확인.
- 구 레이어 모듈이 빈 껍데기가 되면 삭제(잔여 참조 0 확인 후).
