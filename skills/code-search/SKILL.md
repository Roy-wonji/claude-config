---
name: code-search
description: 파일 · 심볼 이름을 모르고 동작이나 개념("토큰 저장", "재시도 로직", "바텀 시트 닫기")으로 코드를 찾을 때 사용한다. 로컬 ChunkHound(Ollama 임베딩) 의미 검색으로 코드를 밖으로 보내지 않고 무료로 찾는다. 이름을 이미 알면 Grep을 쓴다.
---

# code-search

이름을 모를 때 동작 설명으로 코드 위치를 찾는다. 검색 · 임베딩은 모두 로컬(Ollama)에서 돈다.

## 언제

- 기능 설명만 있고 파일을 모를 때, 비슷한 구현 · 플랫폼별 같은 기능을 찾을 때.
- 이름을 알면 쓰지 않는다. Grep · Glob이 더 빠르고 정확하다.

## 방법

1. `chunkhound` MCP 서버(전역 등록)의 도구 `search`를 `type: "semantic"`, 동작을 한 문장으로 설명한 `query`로 부른다. 범위는 `path`로 좁힌다. 정확한 패턴은 `type: "regex"`.
2. MCP가 없으면 CLI를 쓴다: `chunkhound search "설명" --page-size 5` (인덱스가 없으면 git 저장소 루트에서만 `chunkhound index .`. 홈이나 git 밖에서는 돌리지 않는다).
3. 결과 상위 파일을 직접 Read로 열어 확인한 뒤 고친다. 점수만 보고 고치지 않는다.

## 처음 한 번 (맥마다)

```bash
brew install uv ollama
brew services start ollama
ollama pull qwen3-embedding:0.6b
uv tool install --python 3.12 'chunkhound==6.1.0'   # 3.15는 pyarrow 바이너리가 없어 실패한다
```

전역 설정 3가지는 `machine/install.sh`의 "ChunkHound 전역 설정" 단계가 넣는다. 그 단계만 필요하면 install.sh 전체를 돌리지 말고 해당 블록만 실행한다(전체 설치는 `~/.claude` 설정을 덮어쓴다).

| 전역 설정          | 위치                                                                                |
| ------------------ | ----------------------------------------------------------------------------------- |
| 임베딩 · 제외 경로 | `~/.config/chunkhound/chunkhound.json` (원본 `machine/chunkhound.json`, 비밀 값 없음) |
| 인덱스 커밋 방지   | 전역 gitignore(`~/.config/git/ignore`)의 `.chunkhound/`                             |
| MCP 서버           | 사용자 범위 `chunkhound`. git 저장소 루트에서만 실행하고 임베딩은 로컬 Ollama로 고정 |

- git 저장소에서 Claude Code를 열면 MCP 서버가 그 저장소를 처음 한 번 인덱싱해 `.chunkhound/`에 둔다. 큰 저장소는 몇 분 걸리고, 그 뒤는 바뀐 파일만 갱신한다.
- `chunkhound mcp`는 git 밖에서도 현재 폴더 전체를 인덱싱한다. 그래서 git 저장소가 아니거나 홈 폴더면 서버를 띄우지 않는다(MCP 연결만 실패, 다른 작업과 Grep은 그대로).
- 저장소 루트 `.chunkhound.json`이 있으면 전역 설정보다 우선한다. 저장소마다 제외 경로를 바꿀 때만 둔다. 임베딩 주소는 MCP 실행 인자로 고정돼 있어 저장소 설정이 외부로 바꾸지 못한다.

## 도구가 없을 때

- `search` 도구가 없거나 `chunkhound`가 없으면 위 설치를 사용자에게 안내하고 이번 작업은 Grep으로 진행한다.
- 의미 검색만 실패하면 Ollama가 꺼진 것이다(`brew services start ollama`).
- 외부 API로 코드를 보내는 검색 도구(jevgrep 등)는 사용자 승인 없이 쓰지 않는다.
