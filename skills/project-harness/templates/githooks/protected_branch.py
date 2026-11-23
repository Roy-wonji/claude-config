"""git 훅 본체. 커밋 · 병합 · push 순간에 보호 브랜치(.claude/harness.json git.protected)를 막는다.

PreToolUse 훅은 명령 시작 때 브랜치를 본다. 그 사이 다른 세션이 같은 작업 트리의 브랜치를 바꿔도 여기서 다시 막는다.
사용: protected_branch.py commit | protected_branch.py push (stdin: git pre-push 입력)
"""
import json
import os
import subprocess
import sys


DEFAULT = ["main", "develop", "release"]  # check_git_rules.py 기본값과 같게 둔다


def protected(root):
    try:
        with open(os.path.join(root, ".claude", "harness.json"), encoding="utf-8") as f:
            return set(json.load(f).get("git", {}).get("protected", DEFAULT))
    except (OSError, ValueError):
        return set(DEFAULT)


def main():
    names = protected(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # .githooks의 부모 = 하네스 설치 위치
    if sys.argv[1:] == ["push"]:
        targets = [line.split()[2] for line in sys.stdin if len(line.split()) == 4]
    else:
        targets = [subprocess.run(["git", "symbolic-ref", "-q", "HEAD"], capture_output=True, text=True).stdout.strip()]
    for ref in targets:
        if ref.startswith("refs/heads/") and ref.removeprefix("refs/heads/") in names:
            sys.stderr.write(f"[git 규칙] 보호 브랜치 '{ref.removeprefix('refs/heads/')}'에 직접 커밋 · push하지 않습니다. "
                             "feature 브랜치에서 PR로 머지하세요. (.claude/docs/harness.md)\n")
            return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
