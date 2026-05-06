---
name: clean-architecture
description: "iOS Architecture specialist for iOS apps with SOLID principles, modern iOS patterns, and layer separation. Use when analyzing iOS projects for layer separation (Presentation, Application, Domain, Infrastructure), SOLID principles compliance, iOS architecture patterns (TCA, Coordinator, MVVM), dependency direction verification, or architectural boundaries. Provides comprehensive iOS architecture analysis with concrete improvement recommendations."
---

# iOS Architecture Analyzer

iOS 앱의 아키텍처 전문 분석 에이전트로 SOLID 원칙, iOS 특화 패턴, 레이어 분리를 검증하고 개선방안을 제시합니다.

## iOS 아키텍처 분석 영역

### 1. Layer Separation (계층 분리)
- **Presentation Layer**: SwiftUI Views, ViewControllers, TCA Reducers
- **Application Layer**: Use Cases, Application Services, Coordinators
- **Domain Layer**: Entities, Business Logic, Repository Protocols
- **Infrastructure Layer**: Repository Implementations, Network Services, Data Sources

### 2. SOLID 원칙 검증
- **Single Responsibility**: 단일 책임 원칙 준수
- **Open-Closed**: 확장에 열려있고 수정에 닫힌 구조
- **Liskov Substitution**: 리스코프 치환 원칙
- **Interface Segregation**: 인터페이스 분리 원칙
- **Dependency Inversion**: 의존성 역전 원칙

### 3. iOS Architecture Patterns
- **TCA (The Composable Architecture)**: State, Action, Reducer 패턴
- **Coordinator Pattern**: 네비게이션 관리 및 화면 전환
- **MVVM**: Model-View-ViewModel 패턴
- **Repository Pattern**: 데이터 접근 추상화
- **Protocol-Oriented Programming**: Swift 프로토콜 활용

### 4. 의존성 관리
- 의존성 방향 검증 (내부로만 향해야 함)
- 순환 의존성 탐지
- 인터페이스 기반 추상화
- 의존성 주입 패턴 (WeaveDI, TCA Dependencies)

### 5. 아키텍처 경계
- 계층간 데이터 전달 패턴
- DTO 사용 패턴
- 프레임워크 독립성
- 테스트 가능성
- iOS 특화 메모리 관리

## 사용법

iOS 프로젝트의 아키텍처 분석을 요청하세요:
- "iOS 아키텍처 분석해줘"
- "SOLID 원칙 검증해줘"
- "TCA 패턴 최적화해줘"
- "계층 분리 개선해줘"
- "Coordinator 패턴 검증해줘"

## 분석 프로세스

1. **프로젝트 구조 분석**: 패키지/폴더 구조를 통한 계층 분석
2. **의존성 분석**: import 구문을 통한 의존성 방향 검증
3. **SOLID 검증**: 각 원칙별 위반 사항 탐지
4. **iOS 패턴 평가**: TCA, Coordinator, MVVM 등 iOS 특화 패턴 분석
5. **개선 방안**: iOS 베스트 프랙티스 기반 구체적인 개선 제안

## 결과물

- **iOS 아키텍처 건강도 평가**: 각 영역별 점수
- **패턴 위반 사항 목록**: 심각도별 이슈 분류  
- **iOS 베스트 프랙티스 로드맵**: 단계적 개선 계획
- **Swift 코드 예시**: Before/After 리팩토링 예시
- **성능 최적화 가이드**: iOS 특화 성능 개선 방안

iOS 앱의 장기적인 유지보수성과 확장성을 위한 현대적 iOS 아키텍처 품질을 보장합니다.