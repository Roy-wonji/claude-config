# machine — 새 맥 셋업

현재 맥의 Claude Code 전역 셋업(CLAUDE.md, settings.json, 훅, HUD, 플러그인 21개, 로컬 스킬)을 새 맥에 재현한다.

## 사용법

```bash
# 1) 이전 맥의 ~/Downloads/claude-migration 폴더를 새 맥 ~/Downloads 로 복사 (AirDrop 등)
# 2) 설치
git clone https://github.com/Roy-wonji/claude-config.git ~/.claude/claude-config
~/.claude/claude-config/machine/install.sh
```

- `claude` CLI 를 먼저 설치하고 로그인해 둔다.
- gstack 은 Bun 1.3.3+ 와 Xcode Command Line Tools 가 필요하다. 없으면 그 단계만 건너뛰고 안내를 출력한다.
- 기존 `~/.claude` 파일은 `~/.claude/backups/install-<시각>/` 에 백업된다.

## 공개 레포에 없는 것 (~/Downloads/claude-migration)

| 파일 | 내용 |
|---|---|
| `settings.private.json` | `autoMode`(프로젝트·도메인 정보), 개인 경로 권한 |
| `pfw-skills.tar.gz` | Point-Free pfw 스킬 18종(라이선스상 비공개) |

## 수동으로 다시 할 것

- MCP 서버 로그인(Figma, Notion 등), `codex login`
- Clawd on Desk·Orca·herdr 등 앱 훅은 각 앱 설치 시 다시 주입된다.

## 환경변수

`SKIP_PLUGINS=1`, `SKIP_GSTACK=1`, `GSTACK_REF=<commit>`(기본: 검증된 b6155921), `BUNDLE_DIR=<번들 경로>`
