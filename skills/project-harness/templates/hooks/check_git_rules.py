"""Git 규칙 검사. check-git-rules.sh가 git commit / push가 보일 때만 호출한다.
규칙 값은 .claude/harness.json 의 "git" 에서 읽는다(없으면 아래 기본값).

  1) 보호 브랜치(protected)에 직접 커밋 · 푸시 금지, no_delete 브랜치 삭제 금지
  2) 작업 브랜치 이름: branch_pattern
  3) 커밋 제목: {타입}: {설명}[ #{이슈번호}], require_korean · max_subject
  4) .DS_Store 커밋 금지

위반하면 stderr에 이유를 쓰고 exit 2 → Claude Code가 명령을 막는다.
직접 실행: python3 check_git_rules.py --check-message "feat: 설명 추가 #1" / --check-branch "feature/x"
"""
import json
import os
import re
import shlex
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # -I 실행이라 직접 넣는다
import harness_state as hs  # noqa: E402

GIT_CFG = hs.config().get("git", {})
TYPES = "|".join(GIT_CFG.get("commit_types", ["feat", "fix", "refactor", "test", "docs", "chore", "build", "release"]))
REQUIRE_ISSUE = GIT_CFG.get("require_issue", True)
REQUIRE_KOREAN = GIT_CFG.get("require_korean", True)
MAX_SUBJECT = int(GIT_CFG.get("max_subject", 50))
MESSAGE_FORMAT = "{타입}: {설명} #{이슈번호}" if REQUIRE_ISSUE else "{타입}: {설명}"
MESSAGE_RE = re.compile(rf"^({TYPES}): .+ #[0-9]+$" if REQUIRE_ISSUE else rf"^({TYPES}): .+$")
BRANCH_PATTERN = GIT_CFG.get("branch_pattern", r"^feature/[a-z0-9]+(-[a-z0-9]+)*$")
BRANCH_RE = re.compile(BRANCH_PATTERN)
PROTECTED = set(GIT_CFG.get("protected", ["main", "develop", "release"]))
NO_DELETE = list(GIT_CFG.get("no_delete", ["main", "develop"]))
VERIFY_GATE = GIT_CFG.get("verify_gate", True)
HANGUL_RE = re.compile(r"[가-힣]")
SQUASH_SUFFIX_RE = re.compile(r" \(#[0-9]+\)$")

GIT_OPTS = r"(?:\s+(?:-C|-c|--git-dir|--work-tree)\s+\S+|\s+-\S+)*"   # git -C 경로 commit 등
# 명령이 시작되는 자리(처음 · && · || · ; · | · 줄바꿈 · $( · ( 뒤)에 오는 git만 실제 명령으로 본다.
# echo "git commit" 같은 문자열이나 heredoc 본문 속 문장은 검사하지 않는다.
CMD_START = r"(?:^|&&|\|\||;|\||\n|\$\(|\()\s*(?:\w+=\S+\s+)*"
COMMIT_RE = re.compile(CMD_START + r"git" + GIT_OPTS + r"\s+commit(?:\s|$)")
PUSH_RE = re.compile(CMD_START + r"git" + GIT_OPTS + r"\s+push(?:\s|$)")
SEPARATOR_RE = re.compile(r"&&|\|\||;|\||\n")
_NO_DEL = "|".join(map(re.escape, NO_DELETE)) or r"(?!)"
_PROT = "|".join(map(re.escape, sorted(PROTECTED))) or r"(?!)"
PUSH_DELETE_RE = re.compile(rf"(?:--delete|-d)\s.*\b(?:{_NO_DEL})\b|\s:(?:{_NO_DEL})(?:\s|$)")
PUSH_PROTECTED_RE = re.compile(rf"[\s:](?:{_PROT})(?:\s|$)")
HEREDOC_RE = re.compile(r"<<-?\s*['\"]?(\w+)['\"]?\s*\n(.*?)\n\s*\1", re.S)
PLACEHOLDER_RE = re.compile(r"@@HEREDOC(\d+)@@")


def fail(reason):
    sys.stderr.write(f"[git 규칙 위반] {reason}\n규칙: .claude/harness.json (git) · .claude/docs/harness.md\n")
    sys.exit(2)


def check_message(subject):
    if subject.startswith(("Merge ", "Revert ")):
        return
    subject = SQUASH_SUFFIX_RE.sub("", subject)   # 스쿼시 머지가 붙인 " (#PR번호)"는 규칙 밖이다
    if not MESSAGE_RE.match(subject):
        fail(f"커밋 제목 형식은 '{MESSAGE_FORMAT}' 입니다(타입: {TYPES}). 입력: '{subject}'")
    if REQUIRE_KOREAN and not HANGUL_RE.search(subject):
        fail(f"커밋 설명은 한국어로 씁니다. 입력: '{subject}'")
    if len(subject) > MAX_SUBJECT:
        fail(f"커밋 제목은 {MAX_SUBJECT}자 이하입니다. 현재 {len(subject)}자: '{subject}'")


def check_branch(branch):
    if branch in PROTECTED:
        fail(f"보호 브랜치 '{branch}'에는 직접 커밋 · 푸시하지 않습니다. 작업 브랜치에서 PR로 머지하세요.")
    if not BRANCH_RE.match(branch):
        fail(f"브랜치 이름은 '{BRANCH_PATTERN}' 형식입니다. 현재: '{branch}'")


def strip_heredocs(cmd):
    """heredoc 본문을 자리표시(@@HEREDOC{n}@@)로 바꾸고 본문 목록을 돌려준다."""
    bodies = []

    def keep(match):
        bodies.append(match.group(2))
        return f"<<{match.group(1)}\n@@HEREDOC{len(bodies) - 1}@@\n{match.group(1)}"

    return HEREDOC_RE.sub(keep, cmd), bodies


def segment(skeleton, match):
    """git 명령이 시작된 곳부터 다음 명령 구분자 전까지. $( 가 열려 있으면 끝까지 본다."""
    start = match.end()
    end = SEPARATOR_RE.search(skeleton, start)
    if end is None or "$(" in skeleton[start:end.start()]:
        return skeleton[start:]
    return skeleton[start:end.start()]


def commit_subject(part, bodies):
    placeholder = PLACEHOLDER_RE.search(part)
    if placeholder:
        lines = [line.strip() for line in bodies[int(placeholder.group(1))].splitlines() if line.strip()]
        return lines[0] if lines else ""
    try:
        tokens = shlex.split(part)
    except ValueError:
        return ""
    for i, token in enumerate(tokens):
        value = None
        if token in ("-m", "--message") and i + 1 < len(tokens):
            value = tokens[i + 1]
        elif token.startswith("--message="):
            value = token.split("=", 1)[1]
        if value is not None:
            first = value.splitlines()[0] if value else ""
            return "" if "$" in first else first   # 셸 변수 메시지는 실행 전에 알 수 없다
    return ""


def git(*args):
    try:
        return subprocess.run(["git", *args], capture_output=True, text=True, timeout=3).stdout.strip()
    except (OSError, subprocess.TimeoutExpired):
        return ""


def current_branch():
    """.git/HEAD를 직접 읽는다(프로세스 생성 없음). worktree · 하위 폴더처럼 .git 폴더가 없을 때만 git을 부른다."""
    if os.path.isdir(".git"):
        try:
            with open(".git/HEAD", encoding="utf-8") as head:
                ref = head.read().strip()
            return ref[len("ref: refs/heads/"):] if ref.startswith("ref: refs/heads/") else "HEAD"
        except OSError:
            pass
    return git("rev-parse", "--abbrev-ref", "HEAD")


CD_RE = re.compile(r"(?:^|&&|;|\n)\s*cd\s+(\"[^\"]+\"|'[^']+'|\S+)")
GIT_C_RE = re.compile(r"git\s+-C\s+(\"[^\"]+\"|'[^']+'|\S+)")


def command_dir(skeleton, first_git, base):
    """git 명령이 실제로 도는 폴더: 그 앞의 마지막 `cd 경로` 또는 `git -C 경로`. 없으면 훅 입력의 cwd."""
    def resolve(path):
        path = os.path.expanduser(path.strip("\"'"))
        return path if os.path.isabs(path) else os.path.join(base, path)

    target = base
    for m in CD_RE.finditer(skeleton[:first_git.start()]):
        target = resolve(m.group(1))
    git_c = GIT_C_RE.search(skeleton, first_git.start(), first_git.end())
    if git_c:
        target = resolve(git_c.group(1))
    return target if os.path.isdir(target) else base


def main():
    if len(sys.argv) == 3 and sys.argv[1] == "--check-message":
        check_message(sys.argv[2]); print("OK"); return
    if len(sys.argv) == 3 and sys.argv[1] == "--check-branch":
        check_branch(sys.argv[2]); print("OK"); return

    try:
        data = json.load(sys.stdin)
    except ValueError:
        return
    cmd = data.get("tool_input", {}).get("command", "")

    skeleton, bodies = strip_heredocs(cmd)
    commit_matches = list(COMMIT_RE.finditer(skeleton))
    push_matches = list(PUSH_RE.finditer(skeleton))
    commits = [segment(skeleton, m) for m in commit_matches]
    pushes = [segment(skeleton, m) for m in push_matches]
    if not (commits or pushes):
        return

    base = data.get("cwd") or os.environ.get("CLAUDE_PROJECT_DIR") or "."
    first_git = min(commit_matches + push_matches, key=lambda m: m.start())
    os.chdir(command_dir(skeleton, first_git, base))
    branch = current_branch()
    if branch and branch != "HEAD":
        check_branch(branch)

    if any(PUSH_DELETE_RE.search(part) for part in pushes):
        fail(f"{' · '.join(NO_DELETE)} 브랜치는 삭제하지 않습니다.")
    if any(PUSH_PROTECTED_RE.search(part) for part in pushes):
        fail(f"보호 브랜치({' · '.join(sorted(PROTECTED))})로 직접 푸시하지 않습니다. PR을 사용하세요.")
    if not commits:
        return

    staged = git("diff", "--cached", "--name-only").splitlines()
    if any(path == ".DS_Store" or path.endswith("/.DS_Store") for path in staged):
        fail(".DS_Store가 스테이징돼 있습니다. 'git rm --cached <경로>'로 빼세요.")
    for part in commits:
        subject = commit_subject(part, bodies)
        if subject:  # -m 없이 편집기 · -F로 쓰는 커밋은 메시지를 검사하지 않는다
            check_message(subject)
    if VERIFY_GATE:
        check_verified()


def check_verified():
    """검증 게이트: 코드 변경이 있는데 verify 통과 기록과 지문이 다르면 커밋을 막는다."""
    try:
        files = hs.unverified(hs.repo_root("."))
    except Exception:
        return  # 판단할 수 없으면 막지 않는다 (git 오류는 git이 직접 알린다)
    if files:
        shown = ", ".join(files[:5]) + (f" 외 {len(files) - 5}개" if len(files) > 5 else "")
        fail(f"검증하지 않은 코드 변경이 있습니다({shown}). "
             ".claude/scripts/verify로 통과를 확인한 뒤 커밋하세요. 통과 후 코드를 고쳤으면 다시 실행합니다.")


if __name__ == "__main__":
    main()
