#!/usr/bin/env bash
# 공통 config 해석 — 플러그인 platform 레지스트리 기반, 소비자 config 는 선택적 오버라이드.
# 소비자 config (.claude/app-harness.config.json): 있으면 platform + org 값 + verify 오버라이드로 쓴다.
#   없어도 동작한다 — platform 은 레포 파일로 자동 감지하고, 나머지는 레지스트리 기본값을 쓴다.
# 레지스트리 (플러그인 config/platforms.json): platform → 명령·확장자·모델·uiSkill.
#
# 사용:  source "/Users/jung-gonala/.claude/hooks/lib.sh"; ah_load || exit 0
#        GLOB=$(ah_get fileGlob); CMD=$(ah_get formatCmd)
# 변수:  $AH_PLATFORM (플랫폼), $AH_CFG (소비자 config 경로, 없으면 빈 문자열)

# 레지스트리 각 platform 의 indicators 로 현재 레포 플랫폼을 감지 (cwd = 레포 루트)
ah_detect() {
  local p ind
  for p in $(jq -r 'keys[]' "$AH_REG" 2>/dev/null); do
    while IFS= read -r ind; do
      [[ -z "$ind" ]] && continue
      compgen -G "$ind" >/dev/null 2>&1 && { printf '%s' "$p"; return 0; }
    done < <(jq -r --arg p "$p" '.[$p].indicators[]? // empty' "$AH_REG" 2>/dev/null)
  done
}

ah_load() {
  # 소비자 config 는 선택 사항. 있으면 AH_CFG 에 경로를, 없으면 빈 문자열을 둔다.
  AH_CFG=".claude/app-harness.config.json"; [[ -f "$AH_CFG" ]] || AH_CFG="app-harness.config.json"
  [[ -f "$AH_CFG" ]] || AH_CFG=""
  # 레지스트리는 플러그인에 항상 동봉 — 이것만 필수.
  AH_REG="/Users/jung-gonala/.claude/config/platforms.json"
  [[ -f "$AH_REG" ]] || return 1
  # 1) config 에 명시된 platform 이 레지스트리에 있으면 그걸 사용 (오버라이드)
  AH_PLATFORM=""
  if [[ -n "$AH_CFG" ]]; then
    AH_PLATFORM=$(jq -r '.platform // empty' "$AH_CFG" 2>/dev/null)
    [[ -n "$AH_PLATFORM" && -z "$(jq -r --arg p "$AH_PLATFORM" '.[$p] // empty' "$AH_REG" 2>/dev/null)" ]] && AH_PLATFORM=""
  fi
  # 2) 아니면(=config 없음/platform 미지정/미등록) 레포 파일로 자동 감지
  [[ -z "$AH_PLATFORM" ]] && AH_PLATFORM=$(ah_detect)
  [[ -n "$AH_PLATFORM" ]] || return 1
  return 0
}

# verify 키 해석: 소비자 오버라이드(.verify.<key>) 우선, 없으면 레지스트리[platform][key]
ah_get() {
  local k="$1" v
  if [[ -n "$AH_CFG" ]]; then
    v=$(jq -r --arg k "$k" '.verify[$k] // empty' "$AH_CFG" 2>/dev/null)
    [[ -n "$v" && "$v" != "null" ]] && { printf '%s' "$v"; return; }
  fi
  jq -r --arg p "$AH_PLATFORM" --arg k "$k" '.[$p][$k] // empty' "$AH_REG" 2>/dev/null
}
