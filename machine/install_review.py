#!/usr/bin/env python3
"""Install review guidance without replacing existing agent directories."""
import argparse
import os
from pathlib import Path
import shutil
import tempfile

START = '<!-- ROY:REVIEW:START -->'
END = '<!-- ROY:REVIEW:END -->'


def merge(original, policy):
    block = START + '\n' + policy.rstrip() + '\n' + END
    if START in original or END in original:
        if original.count(START) != 1 or original.count(END) != 1:
            raise ValueError('Ambiguous review markers; refusing to overwrite')
        before, rest = original.split(START)
        _, after = rest.split(END)
        return before + block + after
    return original.rstrip() + '\n\n' + block + '\n'


def install(source, claude_home, codex_homes):
    policy = (source / 'codex/HARNESS-POLICY.md').read_text() + '\n' + (source / 'codex/REVIEW-POLICY.md').read_text()
    changes = {}

    def queue(path, text):
        path = path.resolve()
        if not path.exists() or path.read_text() != text:
            changes[path] = text

    for home in [claude_home, *codex_homes]:
        guide = home / ('CLAUDE.md' if home == claude_home else 'AGENTS.md')
        queue(guide, merge(guide.read_text() if guide.exists() else '', policy))
    for agent in (source / 'review-agents').glob('*.md'):
        queue(claude_home / 'agents' / agent.name, agent.read_text())
    for home in codex_homes:
        for agent in (source / 'codex/agents').glob('*_reviewer.toml'):
            queue(home / 'agents' / agent.name, agent.read_text())
    if not changes:
        print('Review setup already current')
        return
    backup_root = claude_home / 'backups'
    backup_root.mkdir(parents=True, exist_ok=True)
    backup = Path(tempfile.mkdtemp(prefix='review-', dir=backup_root))
    for target, text in changes.items():
        if target.exists():
            saved = backup / str(target).lstrip('/')
            saved.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(target, saved)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(text)
        print('Updated:', target)
    print('Backup:', backup)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--claude-home', type=Path, default=Path.home() / '.claude')
    parser.add_argument('--codex-home', type=Path, action='append')
    args = parser.parse_args()
    homes = args.codex_home or [Path.home() / '.codex', Path(os.environ.get('CODEX_HOME', str(Path.home() / '.codex')))]
    install(args.source, args.claude_home, list(dict.fromkeys(homes)))
