---
name: swiftui-instruments-trace
description: Use when the user asks to record/profile an Xcode Instruments .trace (hangs, hitches, CPU hotspots, SwiftUI view updates) or provides a .trace file to analyze. iOS/macOS 실측 성능 분석 — xctrace 녹화 + 4-lane 파서(hangs·hitches·time profiler·SwiftUI) 상관 분석. 
---

# SwiftUI Instruments 트레이스 분석

Xcode Instruments `.trace`를 **녹화**하고 **분석**하는 실측 성능 도구. 추측 대신 xctrace 데이터로 hang·hitch·CPU 핫스팟·SwiftUI 뷰 무효화를 진단한다. `python3`만 있으면 되고, 녹화는 `xctrace`(Xcode) 필요.

`${SKILL_DIR}` = 이 스킬 폴더.

## 1) 트레이스 녹화 — "트레이스 떠줘 / 프로파일 / 세션 캡처"

상세: `references/trace-recording.md`.

1. 대상 확인: `python3 "${SKILL_DIR}/scripts/record_trace.py" --list-devices`
2. 템플릿 선택 — 실기기/호스트 Mac은 기본 `SwiftUI`, **iOS 시뮬레이터는 SwiftUI lane이 비므로** `--template "Time Profiler"`.
3. 녹화(백그라운드 친화 — stop-file 방식):
   ```bash
   python3 "${SKILL_DIR}/scripts/record_trace.py" \
       --template SwiftUI --attach <앱> \
       --stop-file /tmp/stop-trace --output ~/Desktop/session.trace
   ```
4. 사용자가 "다 했다"고 하면 `touch /tmp/stop-trace` → xctrace를 SIGINT로 정리 종료.
5. 결과 트레이스를 아래 분석 워크플로우로 넘긴다.

## 2) 트레이스 분석 — `.trace` 파일이 주어지면

상세: `references/trace-analysis.md`. 대상 SwiftUI 소스는 선택(있으면 라인 인용, 없으면 뷰명·심볼로 위치 추천).

1. 범위 판단: 전체 vs 슬라이스. 슬라이싱 단서 없으면 전체.
2. (선택) 로그/사인포스트로 포커스 윈도우 탐색:
   ```bash
   python3 "${SKILL_DIR}/scripts/analyze_trace.py" --trace <path> --list-logs
   python3 "${SKILL_DIR}/scripts/analyze_trace.py" --trace <path> --list-signposts
   ```
3. 분석(전체 또는 `--window START_MS:END_MS`):
   ```bash
   python3 "${SKILL_DIR}/scripts/analyze_trace.py" --trace <path>
   python3 "${SKILL_DIR}/scripts/analyze_trace.py" --trace <path> --window 1200:3400
   ```
4. `references/trace-analysis.md` 기준으로 해석 — hangs/hitches/time-profiler/SwiftUI 4-lane + 교차 상관. 원인을 코드 위치와 연결.
5. 개선안은 `references/performance-patterns.md`의 패턴으로 제시하고, 가능하면 재녹화로 회귀 검증.

## 참고
| 항목 | 파일 |
|---|---|
| 트레이스 녹화 | `references/trace-recording.md` |
| 트레이스 분석 | `references/trace-analysis.md` |
| 성능 패턴 | `references/performance-patterns.md` |
| 파서 모듈 | `scripts/instruments_parser/` (hangs·hitches·time_profiler·swiftui·correlate) |
