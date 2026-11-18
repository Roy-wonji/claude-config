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

1. 저장소에 `chunkhound` MCP 서버(`.mcp.json`)가 있으면 도구 `search`를 `type: "semantic"`, 동작을 한 문장으로 설명한 `query`로 부른다. 범위는 `path`로 좁힌다. 정확한 패턴은 `type: "regex"`.
2. MCP가 없으면 CLI를 쓴다: `chunkhound search "설명" --page-size 5` (인덱스가 없으면 먼저 `chunkhound index .`).
3. 결과 상위 파일을 직접 Read로 열어 확인한 뒤 고친다. 점수만 보고 고치지 않는다.

## 처음 한 번 (맥마다)

```bash
brew install uv ollama
brew services start ollama
ollama pull qwen3-embedding:0.6b
uv tool install --python 3.12 chunkhound   # 3.15는 pyarrow 바이너리가 없어 실패한다
```

저장소 루트 `.chunkhound.json`(비밀 값 없음, 커밋 가능)과 `.gitignore`의 `.chunkhound/`:

```json
{
  "embedding": {"provider": "openai", "model": "qwen3-embedding:0.6b",
                "base_url": "http://localhost:11434/v1", "api_key": "ollama"},
  "database": {"path": ".chunkhound/db"}
}
```

MCP 등록(프로젝트): `.mcp.json`에 `{"mcpServers": {"chunkhound": {"command": "chunkhound", "args": ["mcp"]}}}`.

## 도구가 없을 때

- `search` 도구가 없거나 `chunkhound`가 없으면 위 설치를 사용자에게 안내하고 이번 작업은 Grep으로 진행한다.
- 의미 검색만 실패하면 Ollama가 꺼진 것이다(`brew services start ollama`).
- 외부 API로 코드를 보내는 검색 도구(jevgrep 등)는 사용자 승인 없이 쓰지 않는다.
