# 멀티 에이전트 / 팀 파이프라인 사용법

이 설정(`claude-config`)은 여러 AI 에이전트가 역할을 나눠 병렬로 일하도록 구성돼 있습니다.

## 설정 (settings.json)
- `teammateMode: "auto"` — `/team`이 띄우는 팀원을 **tmux가 있으면 tmux 패널 병렬**, 없으면 in-process로 실행 (기기 간 동기화 안전).
- `todoFeatureEnabled: true` — 작업 분해/추적 패널 활성화.
- 이 기기엔 `tmux` 설치됨(병렬 멀티 프로세스 가능). 다른 기기는 `brew install tmux`(mac) / `apt install tmux`(linux)로 설치하면 동일하게 tmux 병렬 동작.

## 사용 방법 (OMC 플러그인)
| 명령 | 용도 |
|---|---|
| `/team` | 리서치 → 초안 작성 → 검토를 **역할 분리 병렬 파이프라인**으로 실행 |
| `/oh-my-claudecode:ultrawork` (`ulw`) | 자율 반복 실행 모드 |
| `/oh-my-claudecode:ralph` | 장기 자율 루프 |
| Agent 도구 | 단일 세션 내에서 전문 서브에이전트(Explore/executor 등) 병렬 소환 |

## 권장 흐름 (리서치→작성→검토)
1. `/team` 호출 → 작업 설명.
2. 한 에이전트가 **리서치**(코드/문서 조사), 다른 에이전트가 그 결과로 **초안 작성**, 또 다른 에이전트가 **검토/검증**.
3. tmux 모드면 각 에이전트가 별도 패널에서 동시에 진행되는 걸 눈으로 확인 가능.

## 참고
- 단순 작업(1~2단계)은 멀티에이전트 없이 직접 처리하는 게 빠름.
- 멀티파일 변경·리서치·리뷰 등 독립 단계가 3개 이상일 때 팀/서브에이전트가 유리.

## 멀티 에이전트 코드 리뷰 (Claude + Codex)

| 레인 | 실행 | 보는 것 |
|---|---|---|
| roy 리뷰 팀 | `code-reviewer` 스킬 → style-inspector · security-analyst · performance-analyst · architecture-reviewer 병렬 → review-synthesizer | 영역별 독립 의견 + 충돌 종합 |
| 내장 리뷰 | `/code-review` (로컬, 모든 플랜) · `/ultrareview` (클라우드, 필요할 때만) | 정확성 · 보안 · 엣지 케이스 |
| Codex | `codex exec -s read-only` → 전역 서브에이전트 `security_reviewer` · `performance_reviewer` · `architecture_reviewer` 병렬 | 다른 모델의 독립 교차 의견 |
| PR 자동 리뷰 | Team · Enterprise의 Code Review (GitHub App) | PR마다 인라인 코멘트 |

- 공통 기준: 저장소 루트 `REVIEW.md` (템플릿 `templates/REVIEW.md`). PR 자동 리뷰 · Codex · roy 리뷰 팀이 읽는다. 로컬 `/code-review`는 `CLAUDE.md`만 읽는다.
- Codex 파일: `codex/AGENTS.md`(전역 지침) · `codex/agents/*.toml`(서브에이전트). `machine/install.sh`가 `~/.codex/`에 링크한다.

