#!/usr/bin/env bash
# 새 맥에서 Claude Code 셋업을 재현한다. 여러 번 실행해도 안전(멱등).
#   git clone https://github.com/Roy-wonji/claude-config.git ~/.claude/claude-config
#   ~/.claude/claude-config/machine/install.sh
# 선택: ~/Downloads/claude-migration/{settings.private.json,pfw-skills.tar.gz} 가 있으면 함께 복원.
# 환경변수: SKIP_PLUGINS=1(플러그인 단계 생략), SKIP_GSTACK=1, GSTACK_REF=<commit>, BUNDLE_DIR=<번들 경로>
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
BUNDLE_DIR="${BUNDLE_DIR:-$HOME/Downloads/claude-migration}"
GSTACK_REF="${GSTACK_REF:-b6155921a564ba9ec2470fd2cb3894c05e2c2d13}"
TS="$(date +%Y%m%d-%H%M%S)"
BACKUP="$CLAUDE_DIR/backups/install-$TS"
FAILED=()

log() { printf '\n==> %s\n' "$*"; }
warn() { printf '  ! %s\n' "$*" >&2; }

# 1) 사전 확인
for cmd in git python3 rsync; do
  command -v "$cmd" >/dev/null || { echo "필수 명령 없음: $cmd" >&2; exit 1; }
done
if [ -z "${SKIP_PLUGINS:-}" ] && ! command -v claude >/dev/null; then
  echo "claude CLI 가 없습니다. 먼저 설치하세요: https://code.claude.com/docs/en/setup" >&2
  exit 1
fi

# 2) 핵심 설정 설치 (백업 후 덮어쓰기)
log "기존 설정 백업: $BACKUP"
mkdir -p "$CLAUDE_DIR" "$BACKUP"
for item in CLAUDE.md settings.json hooks hud scripts; do
  if [ -e "$CLAUDE_DIR/$item" ]; then cp -R "$CLAUDE_DIR/$item" "$BACKUP/"; fi
done
# skills 는 덮어쓰기 전에 백업한다. gstack 은 1GB 가까워 제외하고 아래에서 기존 것을 건드리지 않는다.
if [ -d "$CLAUDE_DIR/skills" ]; then
  rsync -a --exclude gstack "$CLAUDE_DIR/skills/" "$BACKUP/skills/"
fi

log "CLAUDE.md · hooks · hud · scripts 설치"
cp "$HERE/CLAUDE.md" "$CLAUDE_DIR/CLAUDE.md"
for d in hooks hud scripts; do
  mkdir -p "$CLAUDE_DIR/$d"
  rsync -a "$HERE/$d/" "$CLAUDE_DIR/$d/"
done
chmod +x "$CLAUDE_DIR"/hooks/*.sh "$CLAUDE_DIR"/scripts/*.sh 2>/dev/null || true

log "settings.json 설치 (비공개 오버레이: $BUNDLE_DIR/settings.private.json)"
python3 "$HERE/merge_settings.py" "$HERE/settings.json" "$BUNDLE_DIR/settings.private.json" "$CLAUDE_DIR/settings.json" "$HOME"

log "로컬 스킬 설치"
mkdir -p "$CLAUDE_DIR/skills"
rsync -a "$HERE/skills/" "$CLAUDE_DIR/skills/"

log "프로젝트별 스킬 라이브러리·매핑 설치 (SessionStart 훅이 스택 감지 후 링크)"
mkdir -p "$CLAUDE_DIR/skill-library"
rsync -a "$HERE/skill-library/" "$CLAUDE_DIR/skill-library/"
if [ -e "$CLAUDE_DIR/project-skills.json" ]; then cp "$CLAUDE_DIR/project-skills.json" "$BACKUP/"; fi
cp "$HERE/project-skills.json" "$CLAUDE_DIR/project-skills.json"

# 3) 마켓플레이스·플러그인 (개별 실패는 기록 후 계속)
if [ -z "${SKIP_PLUGINS:-}" ]; then
  log "마켓플레이스 등록"
  for src in \
    anthropics/claude-plugins-official \
    Roy-wonji/claude-config \
    team-attention/agent-council \
    giuseppe-trisciuoglio/developer-kit \
    warpdotdev/claude-code-warp \
    https://github.com/Yeachan-Heo/oh-my-claudecode.git \
    obra/superpowers \
    chopratejas/headroom \
    affaan-m/ecc \
    doodledood/claude-code-plugins \
    chaseai-yt/claudex-loop; do
    claude plugin marketplace add "$src" >/dev/null 2>&1 || warn "마켓플레이스 추가 실패(이미 있으면 무시): $src"
  done

  log "플러그인 설치"
  while IFS= read -r plugin; do
    if claude plugin install "$plugin" >/dev/null 2>&1; then
      echo "  ok  $plugin"
    else
      FAILED+=("$plugin")
      warn "설치 실패: $plugin"
    fi
  done < <(python3 -c 'import json,sys; [print(k) for k,v in json.load(open(sys.argv[1]))["enabledPlugins"].items() if v]' "$CLAUDE_DIR/settings.json")
fi

# 4) gstack (Bun·Xcode CLT 필요, 미충족이면 이 단계만 건너뜀)
if [ -z "${SKIP_GSTACK:-}" ]; then
  log "gstack ($GSTACK_REF)"
  bun_ok=0
  if command -v bun >/dev/null; then
    bun_ok=$(python3 -c 'import sys; v=tuple(int(x) for x in sys.argv[1].split(".")[:3]); print(1 if v >= (1,3,3) else 0)' "$(bun --version)")
  fi
  if [ "$bun_ok" != 1 ]; then
    warn "Bun 1.3.3 이상 필요 — 'curl -fsSL https://bun.sh/install | bash' 후 다시 실행. gstack 건너뜀"
    FAILED+=("gstack(bun)")
  elif ! xcode-select -p >/dev/null 2>&1; then
    warn "Xcode Command Line Tools 필요 — 'xcode-select --install' 후 다시 실행. gstack 건너뜀"
    FAILED+=("gstack(xcode-clt)")
  else
    G="$CLAUDE_DIR/skills/gstack"
    if [ -d "$G/.git" ]; then
      # 이미 있는 gstack 은 사용자가 쓰던 상태일 수 있어 바꾸지 않는다(업데이트는 /gstack-upgrade).
      echo "  기존 gstack 유지: $(git -C "$G" rev-parse --short HEAD 2>/dev/null)"
    elif git clone -q https://github.com/garrytan/gstack.git "$G" && git -C "$G" checkout -q "$GSTACK_REF" \
         && [ "$(git -C "$G" rev-parse HEAD)" = "$GSTACK_REF" ]; then
      (cd "$G" && ./setup) || FAILED+=("gstack(setup)")
    else
      warn "gstack clone/checkout 실패 또는 커밋 불일치 — setup 실행 안 함"
      FAILED+=("gstack(ref)")
    fi
  fi
fi

# 5) pfw 스킬 번들 (라이선스상 공개 레포에 두지 않음)
if [ -f "$BUNDLE_DIR/pfw-skills.tar.gz" ]; then
  log "pfw 스킬 복원"
  mkdir -p "$HOME/.pfw"
  tar -xzf "$BUNDLE_DIR/pfw-skills.tar.gz" -C "$HOME/.pfw"
  for d in "$HOME/.pfw/skills"/*/; do
    name="$(basename "$d")"
    ln -sfn "$HOME/.pfw/skills/$name" "$CLAUDE_DIR/skills/pfw-$name"
  done
else
  warn "pfw 번들 없음: $BUNDLE_DIR/pfw-skills.tar.gz"
fi

log "완료. 백업: $BACKUP"
if [ ${#FAILED[@]} -gt 0 ]; then
  printf '  실패/건너뜀: %s\n' "${FAILED[@]}"
fi
echo "  MCP 서버 로그인과 Clawd·Orca 등 앱 훅은 각 앱 설치 시 다시 설정됩니다."
