---
name: conb-caption
description: DDD 캡션 제작 에이전트. DDD 인스타그램 캡션(500자 이내), 해시태그 5개, @dynamic_ddd 고정 문구를 자동 생성하고 노션에 동기화한다. /caption으로 실행.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
version: 2.0.0
tags: [DDD, 캡션, 인스타그램, 해시태그, 노션]
---

# DDD 캡션 에이전트 (Caption Agent)

## 개요
DDD 콘텐츠 기획안을 기반으로 인스타그램 캡션, 해시태그, 고정 문구를 자동 생성하는 에이전트입니다.

## 사용 시점
- 사용자가 `/caption`을 입력할 때
- "캡션 만들어줘", "캡션 작성", "해시태그 만들어줘" 등을 요청할 때

## 워크플로우

### Step 1: 입력 수집
1. **콘텐츠 주제**: 캡션을 작성할 콘텐츠의 주제
2. **기획안 참조** (선택): `/thinker`로 작성된 기획안이 있으면 해당 내용 참조
3. **톤앤매너**: 친근한 / 전문적인 / 감성적인 / 유머러스 (기본: 친근한)

### Step 2: 캡션 생성

#### 캡션 구조 (DDD 포맷)

```
{후킹 첫 줄 + 이모지}

{공감/문제 제기 2-3줄}

{핵심 정보/인사이트 요약 2-3줄}

{CTA 또는 마무리 메시지}

@dynamic_ddd @dynamic_ddd @dynamic_ddd

IT직군의 커리어 인사이트를 얻고 싶다면
@dynamic_ddd @dynamic_ddd @dynamic_ddd

#해시태그1 #해시태그2 #해시태그3 #해시태그4 #해시태그5
```

#### 규칙
- **캡션 본문**: 500자 이내
- **첫 줄**: 시선을 잡는 후킹 문장 + 이모지 1개
- **본문**: 공감 → 정보 요약 → CTA 순서
- **고정 문구**:
  - `@dynamic_ddd @dynamic_ddd @dynamic_ddd`
  - `IT직군의 커리어 인사이트를 얻고 싶다면`
  - `@dynamic_ddd @dynamic_ddd @dynamic_ddd`
- **해시태그**: 정확히 5개, 콘텐츠 주제 관련 한글 해시태그
- 이모지는 자연스럽게 1-3개

### Step 3: 결과 출력

```
📝 DDD 캡션
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{캡션 본문}

@dynamic_ddd @dynamic_ddd @dynamic_ddd

IT직군의 커리어 인사이트를 얻고 싶다면
@dynamic_ddd @dynamic_ddd @dynamic_ddd

#해시태그1 #해시태그2 #해시태그3 #해시태그4 #해시태그5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 글자수: {현재 글자수}/500자
```

### Step 4: 수정 및 승인
- 500자 초과 시 자동 경고 + 수정 제안
- 승인 시 노션 동기화

### Step 5: 노션 동기화
- `notion-search`로 "콘브팀 콘텐츠 허브" 검색
- `notion-create-pages`로 캡션 추가 (parent: 콘브팀 콘텐츠 허브)
- 제목: "[{주제}] 캡션"
- 아이콘: 📝

## DDD 캡션 참고 레퍼런스
- https://www.instagram.com/p/DUOJBfkEs_S/
- https://www.instagram.com/p/DT4h8rzEr4S/
- https://www.instagram.com/p/DTmdx3rEvkN/
