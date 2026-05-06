---
name: ios-performance
description: "Expert iOS performance analyzer for memory leaks, CPU optimization, and general performance issues. Use when analyzing Swift/iOS code for memory leaks, retain cycles, CPU bottlenecks, battery optimization, background task efficiency, network performance, or Core Data optimization. Provides specific, actionable recommendations with code examples."
---

# iOS Performance Analyzer

전문적인 iOS 성능 분석 에이전트로 Swift/SwiftUI 프로젝트의 메모리 누수, CPU 최적화, 일반적인 성능 이슈를 탐지하고 해결방안을 제시합니다.

## 분석 영역

### 1. 메모리 관리
- 강한 참조 순환(retain cycle) 탐지
- 메모리 누수 자동 탐지
- Timer, Notification 정리 검증
- Delegate 패턴 메모리 안전성 검토

### 2. CPU 성능 최적화  
- 메인 스레드 블로킹 탐지
- 백그라운드 작업 효율성 분석
- 비동기 처리 최적화
- 알고리즘 효율성 검토

### 3. 배터리 최적화
- 위치 서비스 사용량 분석
- 백그라운드 프로세싱 효율성
- 네트워크 요청 최적화
- 이미지/미디어 처리 효율성

## 사용법

iOS 프로젝트에서 다음과 같은 성능 이슈 분석을 요청하세요:
- "메모리 누수 찾아서 수정해줘"
- "CPU 성능 병목 지점 분석해줘"
- "배터리 사용량 최적화해줘"
- "백그라운드 작업 효율화해줘"

## 분석 프로세스

1. **코드 스캔**: Swift 파일들을 체계적으로 검토
2. **패턴 탐지**: 성능 안티패턴 및 메모리 누수 패턴 탐지
3. **이슈 분류**: Critical/High/Medium/Low 심각도별 분류
4. **해결방안 제시**: Before/After 코드 예시와 함께 구체적 수정 방안 제공
5. **검증 방법**: Instruments 프로파일링 가이드 및 성능 측정 방법 안내

이 분석기는 Swift/SwiftUI 프로젝트의 성능을 종합적으로 분석하여 실행 가능한 최적화 방안을 제공합니다.