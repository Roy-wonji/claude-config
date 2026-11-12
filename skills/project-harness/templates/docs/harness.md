# 에이전트 하네스

하네스는 에이전트가 일하는 환경 전체다. 규칙 파일, 경로별 규칙, 훅, 스킬로 이루어진다.
`project-harness` 스킬로 설치했다(원형: CIRQLE-Native-Mobile).

- 프롬프트 지시는 확률이고, 실행되는 검사는 보장이다. 실수가 나오면 프롬프트를 고치기보다 그 실수가 구조적으로 불가능하게 만든다.
- 세 축으로 관리한다. **Context**(무엇을 읽게 할지) · **Control**(무엇을 막고 확인할지) · **Observability**(무엇이 쓰이는지 보고 정리).
- 규칙 파일은 짧게(200줄 미만), 경로별로 나눈다. 코드만 봐서는 알 수 없는 팀 규칙만 적는다.
- 규칙은 Hard(반드시)와 Soft(권장)로 나눈다. Soft는 기존 코드가 다르면 기존 코드를 따른다.

## 구성

| 종류 | 위치 | 역할 |
|------|------|------|
| 프로젝트 규칙 | `CLAUDE.md` | 개요 · Hard 규칙 · 문서 색인 |
| 하네스 설정 | `.claude/harness.json` | 코드 경로 · 기준 브랜치 · git 규칙 · 검증 단계 |
| 상세 문서 | `.claude/docs/*.md` | 영역별 규칙 |
| 경로별 규칙 | `.claude/rules/*.md` | frontmatter `paths`에 맞는 파일을 다룰 때만 |
| 훅 | `.claude/hooks/*` + `.claude/settings.json` | 규칙 강제 · 사용 기록 |
| 스크립트 | `.claude/scripts/verify` · `harness-report` | 검증 · 사용 리포트 |
| 로컬 상태 | `.claude/state/` (git 제외) | 검증 기록 · 사용 기록 · 로그 |

## 훅

| 이벤트 | 스크립트 | 검사 |
|--------|----------|------|
| `PreToolUse` (Bash) | `check-git-rules.sh` → `check_git_rules.py` | 보호 브랜치 커밋 · 푸시 금지, 브랜치 이름, 커밋 제목, `.DS_Store`, 검증 안 된 코드 커밋 금지 |
| `PostToolUse` (Read · Skill) | `usage_log.py` | 하네스 문서 · 스킬 사용 기록 |
| `Stop` | `stop_guard.py` | 검증 안 된 코드 변경이 있으면 종료를 한 번 막고 verify 안내 |

- git commit · push가 아니면 bash 문자열 비교만 하고 끝낸다. 해당할 때만 python을 한 번(`-I -S`) 실행한다.
- `$( … )` 안에 heredoc으로 스크립트를 넘기지 않는다(macOS에서 멈춘 적 있음). 스크립트는 파일로 둔다.
- 위반하면 `exit 2` + stderr로 막는다. 훅을 고치면 실제 세션에서 막히는지 확인한다.

직접 검사(Codex 등 훅이 없는 환경):

```bash
bash .claude/hooks/check-git-rules.sh --check-message "feat: 기능 추가 #3"
bash .claude/hooks/check-git-rules.sh --check-branch "feature/new-thing"
```

## 검증 게이트

```bash
.claude/scripts/verify          # 기준 브랜치 이후 바뀐 코드에 맞는 단계만
.claude/scripts/verify --all    # 모든 단계
```

- 단계는 `.claude/harness.json` 의 `verify.steps`에 둔다. `paths`가 비면 코드 변경 시 항상 돈다.
- 통과하면 코드 내용 지문을 `.claude/state/verify.json`에 남긴다. 통과 후 코드를 고치면 커밋이 막힌다.
- 각 단계 출력은 `.claude/state/verify/{단계}.log`. 종료 코드를 파이프(`| tail`)로 가리지 않는다.
- 같은 단계가 `max_failures`번 연속 실패하면 세 번째 시도 전에 사용자에게 보고하고 승인을 받는다.

## 관측과 정리

```bash
.claude/scripts/harness-report --days 30
```

- 한 달에 한 번 보고, 오래 안 읽힌 문서는 합치거나 지운다.
- 에이전트가 같은 실수를 두 번 하면 문서에 적고, 세 번째부터는 훅으로 만든다.

## 겪은 문제

- `git stash`는 같은 작업 트리를 쓰는 다른 세션의 변경을 날릴 수 있다. 쓰지 않는다. 지문 계산은 임시 index로 한다.
- `codex exec`는 stdin을 닫지 않으면 입력을 기다리며 멈춘다. `< /dev/null`을 붙인다.
