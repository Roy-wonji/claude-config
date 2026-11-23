#!/usr/bin/env python3
"""project-harness 템플릿을 대상 프로젝트에 설치한다.

사용: python3 apply.py <프로젝트 루트> [--force]
- .claude/{hooks,scripts,docs/harness.md} 를 복사한다. 이미 있는 파일은 --force 가 없으면 건너뛴다.
- .claude/harness.json 은 없을 때만 예시를 복사한다(프로젝트 값으로 직접 고친다).
- .claude/settings.json 에 하네스 훅 3개를 병합한다(같은 command 가 있으면 추가하지 않음).
- .gitignore 에 .claude/state/ 를 추가한다.
- .githooks/ 에 보호 브랜치 git 훅(pre-commit · pre-merge-commit · pre-push)을 복사하고, core.hooksPath 가 비어 있으면 .githooks 로 켠다.
"""
import json
import os
import shutil
import stat
import subprocess
import sys

TEMPLATES = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates")


def copy(src, dst, force, report):
    if os.path.exists(dst) and not force:
        report.append(f"건너뜀(이미 있음) {dst}")
        return
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copy2(src, dst)
    report.append(f"복사 {dst}")


def merge_hooks(settings_path, report):
    with open(os.path.join(TEMPLATES, "settings.json"), encoding="utf-8") as f:
        template = json.load(f)
    settings = {}
    if os.path.exists(settings_path):
        with open(settings_path, encoding="utf-8") as f:
            settings = json.load(f)
    hooks = settings.setdefault("hooks", {})
    existing = {h.get("command") for groups in hooks.values() for g in groups for h in g.get("hooks", [])}
    added = 0
    for event, groups in template["hooks"].items():
        for group in groups:
            new = [h for h in group["hooks"] if h["command"] not in existing]
            if new:
                hooks.setdefault(event, []).append({**group, "hooks": new})
                added += len(new)
    with open(settings_path, "w", encoding="utf-8") as f:
        json.dump(settings, f, indent=2, ensure_ascii=False)
        f.write("\n")
    report.append(f"settings.json 훅 {added}개 추가")


def install_git_hooks(root, force, report):
    """명령 시작 뒤 다른 세션이 브랜치를 바꿔도 커밋 · push 순간에 막도록 git 훅을 둔다."""
    src = os.path.join(TEMPLATES, "githooks")
    for name in sorted(os.listdir(src)):
        if not os.path.isfile(os.path.join(src, name)) or name.startswith("."):
            continue
        dst = os.path.join(root, ".githooks", name)
        copy(os.path.join(src, name), dst, force, report)
        os.chmod(dst, os.stat(dst).st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
    def git(*args):
        return subprocess.run(["git", "-C", root, *args], capture_output=True, text=True).stdout.strip()
    top = git("rev-parse", "--show-toplevel")
    if not top:
        report.append("git 저장소가 아니라 .githooks 를 연결하지 않았습니다")
        return
    # 하위 폴더에 설치해도 저장소 루트 기준 경로로 연결한다
    wanted = os.path.relpath(os.path.join(root, ".githooks"), top)
    current = git("config", "--get", "core.hooksPath")
    hooks_dir = os.path.join(root, git("rev-parse", "--git-path", "hooks"))
    existing = [n for n in (os.listdir(hooks_dir) if os.path.isdir(hooks_dir) else []) if not n.endswith(".sample")]
    if current == wanted:
        return
    if current or existing:
        # 이미 쓰는 훅(commit-msg · Git LFS pre-push 등)을 끄지 않도록 바꾸지 않는다
        report.append(f"기존 git 훅({current or ', '.join(existing)})이 있어 core.hooksPath 를 바꾸지 않았습니다. "
                      f"{wanted} 의 훅을 기존 훅에서 부르도록 직접 연결하세요")
        return
    git("config", "core.hooksPath", wanted)
    report.append(f"core.hooksPath = {wanted}")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    force = "--force" in sys.argv[1:]
    if len(args) != 1 or not os.path.isdir(args[0]):
        print(__doc__)
        return 1
    root = os.path.abspath(args[0])
    claude = os.path.join(root, ".claude")
    report = []

    for sub in ("hooks", "scripts"):
        for name in sorted(os.listdir(os.path.join(TEMPLATES, sub))):
            if not os.path.isfile(os.path.join(TEMPLATES, sub, name)) or name.startswith("."):
                continue
            dst = os.path.join(claude, sub, name)
            copy(os.path.join(TEMPLATES, sub, name), dst, force, report)
            if sub == "scripts" or name.endswith(".sh"):
                os.chmod(dst, os.stat(dst).st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
    copy(os.path.join(TEMPLATES, "docs", "harness.md"), os.path.join(claude, "docs", "harness.md"), force, report)
    copy(os.path.join(TEMPLATES, "harness.json"), os.path.join(claude, "harness.json"), False, report)
    merge_hooks(os.path.join(claude, "settings.json"), report)
    install_git_hooks(root, force, report)

    gitignore = os.path.join(root, ".gitignore")
    lines = open(gitignore, encoding="utf-8").read().splitlines() if os.path.exists(gitignore) else []
    if ".claude/state/" not in lines:
        with open(gitignore, "a", encoding="utf-8") as f:
            f.write(("\n" if lines and lines[-1] else "") + ".claude/state/\n")
        report.append(".gitignore 에 .claude/state/ 추가")

    print("\n".join(report))
    print("\n다음: .claude/harness.json 의 code_dirs · git · verify.steps 를 프로젝트에 맞게 고친다.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
