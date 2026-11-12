---
name: project-harness
description: 프로젝트에 에이전트 하네스(Context·Control·Observability)를 설치한다 — git 규칙 훅(보호 브랜치·브랜치 이름·한국어 커밋 제목), 검증 게이트(verify 통과 전 커밋·종료 차단), 하네스 문서·스킬 사용 기록과 리포트. CIRQLE-Native-Mobile 하네스를 범용화한 것. "하네스 설치", "하네스 적용", "harness 깔아", "verify 게이트", "커밋 규칙 훅" 요청이나 새 프로젝트에 규칙·검증 체계를 잡을 때 사용.
---

# project-harness

CIRQLE-Native-Mobile 의 `.claude/` 하네스를 어느 프로젝트에나 깔 수 있게 만든 템플릿이다.
프로젝트별 값은 `.claude/harness.json` 하나에 모은다. 훅·스크립트 코드는 프로젝트마다 고치지 않는다.

## 설치 절차

1. 대상 프로젝트의 스택·브랜치 전략을 파악한다(`git branch -a`, 빌드 도구 파일, 기존 `.claude/settings.json`, CI 설정).
2. 설치한다. 기존 파일은 덮어쓰지 않는다(덮으려면 `--force`).
   ```bash
   python3 <이 스킬 폴더>/apply.py <프로젝트 루트>
   ```
3. `.claude/harness.json` 을 프로젝트에 맞게 고친다. 값이 애매하면 사용자에게 묻는다.
   - `code_dirs` · `code_files`: 검증이 필요한 코드 경로. `["*"]` 면 문서·`.claude/` 밖 전부.
   - `base_refs`: 변경 비교 기준 브랜치(처음 존재하는 것을 쓴다).
   - `git`: `protected`, `no_delete`, `branch_pattern`, `commit_types`, `require_issue`, `require_korean`, `max_subject`, `verify_gate`.
   - `verify.steps`: `{name, cmd[], cwd, paths[], env{}, fail_if_log_matches}`. `paths` 접두 경로가 바뀔 때만 돈다(비면 항상).
4. `CLAUDE.md` 에 하네스 문서 색인 한 줄을 추가한다: `하네스: .claude/docs/harness.md`.
5. 확인한다.
   ```bash
   bash .claude/hooks/check-git-rules.sh --check-message "feat: 기능 추가 #1"   # OK
   bash .claude/hooks/check-git-rules.sh --check-branch "main"                 # 막힘(exit 2)
   .claude/scripts/verify --all
   ```
   그리고 실제 세션에서 보호 브랜치 커밋이 막히는지 한 번 본다.

## 원칙

- 프롬프트 지시는 확률, 실행되는 검사는 보장이다. 같은 실수가 세 번째면 훅으로 만든다.
- 규칙 파일은 200줄 미만, 경로별 규칙은 `.claude/rules/*.md` 의 frontmatter `paths` 로 나눈다.
- 원본 하네스(KMP·Tuist·Gradle 단계, 모듈 경계 검사)는 CIRQLE-Native-Mobile `.claude/` 에 그대로 있다. 비슷한 스택이면 그 `verify` 단계를 참고해 `verify.steps` 로 옮긴다.
- 상세: `templates/docs/harness.md` (설치 후 `.claude/docs/harness.md`).
