---
name: figma-pencil-ui-fallback
description: Implement UI from a Figma design, automatically falling back to Pencil MCP when the Figma MCP hits its usage/rate limit. Use when building screens or components from a Figma file (figma.com URL or Figma MCP), when the Figma MCP returns a quota/rate-limit/429 error, or when you need to replicate a design into a .pen file and generate UI from it. Triggers on "figma 한도", "figma limit", "pencil로 복제", "디자인 그대로 UI".
---

# Figma → Pencil UI Fallback

Figma MCP 로 디자인을 읽어 UI 를 구현하되, **Figma MCP 가 한도(rate limit / quota / 429)에 걸리면 Pencil MCP 로 자동 전환**해 디자인을 똑같이 복제하고 그것으로 UI 를 그린다.

## 언제 쓰나
- Figma 디자인(figma.com URL 또는 Figma MCP)에서 화면/컴포넌트를 코드로 구현할 때
- Figma MCP 호출이 한도 초과/요청 제한 에러를 반환할 때
- 디자인을 `.pen` 파일로 복제한 뒤 그것을 기준으로 UI 를 생성하고 싶을 때

## 워크플로우

### 1) 우선 Figma MCP 시도
- `mcp__plugin_figma_figma__get_design_context` / `get_screenshot` / `get_metadata` / `get_variable_defs` 로 디자인·토큰·스크린샷 확보.
- (쓰기/실행이 필요하면) `figma-use` 스킬을 먼저 로드 후 `use_figma`.
- 확보한 컨텍스트(레이아웃·간격·색·타이포·컴포넌트)를 그대로 코드로 옮긴다.

### 2) 한도 감지 → Pencil 폴백
다음 신호 중 하나라도 보이면 즉시 Pencil 경로로 전환한다:
- 에러 메시지에 `rate limit`, `quota`, `429`, `too many requests`, `usage limit`, `한도`
- Figma MCP 가 반복 실패하거나 빈 응답

전환 시:
1. **마지막으로 확보한 Figma 스크린샷/메타데이터를 레퍼런스로 고정**한다(가능하면 전환 전에 `get_screenshot` 1장은 미리 떠둔다).
2. Pencil 로 동일 디자인을 복제한다:
   - `mcp__pencil__get_editor_state(include_schema: true)` 로 스키마 확보(필수).
   - `mcp__pencil__get_guidelines` 로 규칙 확인.
   - `mcp__pencil__batch_design` 으로 레퍼런스와 **픽셀/레이아웃이 일치**하도록 프레임·텍스트·색·간격을 재현(`FindEmptySpace` 로 위치 확보).
   - `mcp__pencil__get_screenshot` 으로 복제본을 Figma 레퍼런스와 대조(색 대비·정렬·클리핑 확인). 어긋나면 노드를 직접 Update 로 보정(삭제 후 재생성 금지).

### 3) .pen → UI 코드
- 복제한 `.pen` 노드의 수치(좌표·크기·gap·padding·색·폰트)를 그대로 읽어(`batch_get` / `snapshot_layout`) 대상 프레임워크 코드로 변환.
- SwiftUI 면 디자인 토큰(색/폰트 단축형)에 매핑, 프로젝트의 기존 컴포넌트·컨벤션 재사용.
- 마지막에 빌드/프리뷰로 시각 일치 검증.

## 충실도 체크리스트
- [ ] 레이아웃 안 깨짐(collapse/overflow 없음), 프레임이 콘텐츠를 담음
- [ ] 색 대비·정렬·간격이 레퍼런스와 일치
- [ ] 텍스트 wrapping/줄간격/폰트 weight 일치
- [ ] 토큰화 가능한 값은 하드코딩 대신 디자인 토큰 사용

## 한도 우회 / 활용 팁
공식 Figma MCP 한도가 부담되거나 막힐 때:
- **커뮤니티 플러그인 활용**: 공식 MCP 대신 *Talk to Figma MCP* 같은 커뮤니티 플러그인을 쓰면 무료 계정으로도 제한 없이 프롬프트 사용 가능.
- **프롬프트/디자인 최적화**: 레이어가 복잡하거나 **Auto Layout 미적용**이면 토큰을 더 쓰고 오류가 잦아진다. 레이어를 단순·깔끔하게 정리하고 Auto Layout 을 적용한 뒤 요청하면 토큰 한도 문제를 예방.
- 위 방법으로도 막히면 이 스킬의 **Pencil 폴백**(디자인 복제 → .pen → UI) 으로 전환.

## 참고
- ios-simulator skill: https://claudeskills.info/skill/ios-simulator-skill/
- thought-based-reasoning skill: https://claudeskills.info/skill/thought-based-reasoning/
- Apple skills 모음(rshankras): https://github.com/rshankras/claude-code-apple-skills

## 주의
- Pencil `.pen` 은 암호화 — `mcp__pencil__*` 도구로만 접근(Read/Grep 금지).
- Pencil 은 CSS/HTML 이 아닌 자체 레이아웃 모델 — 스키마에 있는 속성만 사용.
- 한도 전환 후에도 Figma 토큰 값(색/타이포)을 이미 확보했다면 그대로 신뢰.
