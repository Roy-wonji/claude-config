"""하네스 공용 상태: 코드 변경 판별 · 작업 트리 지문 · 검증 기록. (.claude/docs/harness.md)

verify(.claude/scripts/verify) · 커밋 게이트(check_git_rules.py) · 종료 확인(stop_guard.py)이 함께 쓴다.
프로젝트별 값은 .claude/harness.json 하나에서 읽는다. 상태는 .claude/state/(git 제외)에 둔다.
"""
import hashlib
import json
import os
import shutil
import subprocess
import tempfile
import time

CONFIG_FILE = os.path.join(".claude", "harness.json")
_HERE = os.path.dirname(os.path.abspath(__file__))


def config():
    """.claude/harness.json. 훅이 어느 폴더에서 불려도 이 파일 위치(.claude/hooks/..)를 기준으로 찾는다."""
    try:
        with open(os.path.join(_HERE, "..", "harness.json"), encoding="utf-8") as f:
            data = json.load(f)
    except (OSError, ValueError):
        return {}
    return data if isinstance(data, dict) else {}  # 형식이 틀리면 기본값으로 동작한다(훅이 세션을 막지 않게)


def _strs(value):
    return tuple(v for v in value if isinstance(v, str)) if isinstance(value, list) else ()


_CFG = config()
# 검증이 필요한 코드 경로. 문서(.claude/ · *.md)만 바뀌면 검증하지 않는다.
CODE_DIRS = _strs(_CFG.get("code_dirs"))
CODE_FILES = _strs(_CFG.get("code_files"))
BASE_REFS = _strs(_CFG.get("base_refs")) or ("origin/develop", "develop", "origin/main", "main")
STATE_DIR = os.path.join(".claude", "state")
VERIFY_FILE = os.path.join(STATE_DIR, "verify.json")
MAX_FAILURES = _CFG["max_failures"] if isinstance(_CFG.get("max_failures"), int) else 2  # 같은 단계가 이 횟수만큼 연속 실패하면 사용자에게 보고한다


def git(root, *args, env=None):
    return subprocess.run(
        ["git", "-C", root, *args], capture_output=True, text=True, env=env, check=True, timeout=30
    ).stdout


def is_code(path):
    if path.endswith(".md") or path.startswith(".claude/"):
        return False
    if "*" in CODE_DIRS:  # 문서 · .claude/ 밖의 모든 파일을 코드로 본다
        return True
    return path in CODE_FILES or path.split("/", 1)[0] in CODE_DIRS


def repo_root(start):
    return git(start, "rev-parse", "--show-toplevel").strip()


def base_ref(root):
    """비교 기준: base_refs 중 처음 존재하는 브랜치와 갈라진 지점."""
    for ref in BASE_REFS:
        try:
            return git(root, "merge-base", "HEAD", ref).strip()
        except subprocess.CalledProcessError:
            continue
    return "HEAD"


def changed_code_files(root):
    """기준 브랜치 이후 바뀐 코드 파일(커밋 · 스테이징 · 작업 중 · 새 파일 모두)."""
    tracked = git(root, "diff", "--name-only", base_ref(root)).splitlines()
    untracked = git(root, "ls-files", "--others", "--exclude-standard").splitlines()
    return sorted({p for p in tracked + untracked if is_code(p)})


def fingerprint(root):
    """작업 트리의 코드 파일 내용 지문. 커밋으로 나눠 담아도 내용이 같으면 같은 값이다."""
    fd, index = tempfile.mkstemp(prefix="harness-index-")
    os.close(fd)
    try:
        real_index = git(root, "rev-parse", "--path-format=absolute", "--git-path", "index").strip()
        if os.path.exists(real_index):
            shutil.copyfile(real_index, index)  # stat 정보를 살려 다시 해시하지 않게 한다
        else:
            os.unlink(index)
        env = dict(os.environ, GIT_INDEX_FILE=index)
        paths = present_code_paths(root)
        if not paths:
            return hashlib.sha256(b"").hexdigest()
        git(root, "add", "-A", "--", *paths, env=env)
        tree = git(root, "write-tree", env=env).strip()
        listing = git(root, "ls-tree", "-r", tree, "--", *paths).splitlines()
        code = [line for line in listing if is_code(line.split("\t", 1)[-1])]  # .spec 등 문서는 지문에서 뺀다
        return hashlib.sha256("\n".join(code).encode()).hexdigest()
    finally:
        if os.path.exists(index):
            os.unlink(index)


def present_code_paths(root):
    if "*" in CODE_DIRS:
        return ["."]
    return [p for p in CODE_DIRS + CODE_FILES if os.path.exists(os.path.join(root, p))]


def load(root):
    try:
        with open(os.path.join(root, VERIFY_FILE), encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


def save(root, state):
    os.makedirs(os.path.join(root, STATE_DIR), exist_ok=True)
    state["at"] = time.strftime("%Y-%m-%dT%H:%M:%S")
    with open(os.path.join(root, VERIFY_FILE), "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)


def unverified(root):
    """검증이 필요한데 마지막 통과 기록과 지문이 다르면 바뀐 코드 파일 목록을 돌려준다."""
    files = changed_code_files(root)
    if not files:
        return []
    state = load(root)
    if state.get("passed") and state.get("fingerprint") == fingerprint(root):
        return []
    return files
