"""SessionStart 훅: 프로젝트 스택을 감지해 필요한 스킬을 <프로젝트>/.claude/skills/ 에 링크한다.

- 매핑: ~/.claude/project-skills.json (stacks.<이름>.markers 중 하나라도 있으면 skills 를 링크)
- 원본: library(기본 ~/.claude/skill-library). 없는 스킬은 건너뛴다.
- 이미 전역(~/.claude/skills)에 있거나 프로젝트에 같은 이름이 있으면 건너뛴다(중복 로드 방지).
- 링크는 .git/info/exclude 에 넣어 커밋에 섞이지 않게 한다.
- 어떤 오류가 나도 세션을 막지 않는다(항상 exit 0).
"""
import glob
import json
import os
import subprocess
import sys

HOME = os.path.expanduser("~")
CONFIG = os.path.join(HOME, ".claude", "project-skills.json")
GLOBAL_SKILLS = os.path.join(HOME, ".claude", "skills")


def project_root(start):
    path = os.path.abspath(start)
    while True:
        if os.path.exists(os.path.join(path, ".git")):
            return path
        parent = os.path.dirname(path)
        if parent == path:
            return None
        path = parent


def exclude_file(root):
    try:
        out = subprocess.run(["git", "-C", root, "rev-parse", "--path-format=absolute", "--git-path", "info/exclude"],
                             capture_output=True, text=True, timeout=5).stdout.strip()
        return out or None
    except (OSError, subprocess.TimeoutExpired):
        return None


def main():
    try:
        data = json.load(sys.stdin)
    except ValueError:
        data = {}
    root = project_root(data.get("cwd") or os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd())
    if not root or root == HOME:
        return
    try:
        with open(CONFIG, encoding="utf-8") as f:
            cfg = json.load(f)
    except (OSError, ValueError):
        return
    if not isinstance(cfg, dict) or not isinstance(cfg.get("stacks"), dict):
        return
    library = os.path.expanduser(str(cfg.get("library", "~/.claude/skill-library")))

    stacks, wanted = [], []
    for name, rule in cfg["stacks"].items():
        if not isinstance(rule, dict):
            continue
        markers = [m for m in rule.get("markers", []) if isinstance(m, str)]
        if any(glob.glob(os.path.join(root, m)) for m in markers):
            stacks.append(name)
            wanted += [s for s in rule.get("skills", []) if isinstance(s, str) and s not in wanted]
    if not wanted:
        return

    dest_dir = os.path.join(root, ".claude", "skills")
    linked = []
    for skill in wanted:
        src = os.path.join(library, skill)
        dst = os.path.join(dest_dir, skill)
        if not os.path.isdir(src) or os.path.lexists(dst) or os.path.exists(os.path.join(GLOBAL_SKILLS, skill)):
            continue
        os.makedirs(dest_dir, exist_ok=True)
        os.symlink(src, dst)
        linked.append(skill)
    if not linked:
        return

    exclude = exclude_file(root)
    if exclude:
        try:
            existing = open(exclude, encoding="utf-8").read().splitlines() if os.path.exists(exclude) else []
            lines = [f"/.claude/skills/{s}" for s in linked if f"/.claude/skills/{s}" not in existing]
            if lines:
                os.makedirs(os.path.dirname(exclude), exist_ok=True)
                with open(exclude, "a", encoding="utf-8") as f:
                    f.write(("\n" if existing and existing[-1] else "") + "\n".join(lines) + "\n")
        except OSError:
            pass

    print(json.dumps({"hookSpecificOutput": {
        "hookEventName": "SessionStart",
        "additionalContext": (f"[project-skills] 감지한 스택: {', '.join(stacks)}. "
                              f"프로젝트 스킬로 링크함: {', '.join(linked)} (.claude/skills/, git 제외). "
                              "이번 세션에서 목록에 안 보이면 다음 세션부터 로드된다."),
    }}, ensure_ascii=False))


if __name__ == "__main__":
    try:
        main()
    except Exception:
        pass
