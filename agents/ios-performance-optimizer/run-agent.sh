#!/bin/bash

# iOS Performance Optimization Agent Runner
# 어디서든 실행 가능한 글로벌 스크립트

AGENT_DIR="/Users/suhwonji/.claude/agents/ios-performance-optimizer"

echo "🚀 iOS 자동 성능 최적화 시스템 v2.0 시작..."
echo "✨ 새로운 기능: 자동 개선 계획 생성 및 승인 기반 코드 수정"
echo "📍 현재 위치: $(pwd)"
echo "🔧 에이전트 위치: $AGENT_DIR"
echo "🔄 진행 단계: 분석 → 계획 → 승인 → 수정 → 보고"
echo ""

# 에이전트 디렉토리로 이동
cd "$AGENT_DIR"

# API 키 확인
if [ ! -f ".env" ]; then
    echo "❌ .env 파일이 없습니다!"
    echo "💡 다음 명령어로 .env 파일을 생성하세요:"
    echo "   cp .env.example .env"
    echo "   그리고 ANTHROPIC_API_KEY를 설정하세요."
    exit 1
fi

# 의존성 확인
if [ ! -d "node_modules" ]; then
    echo "📦 의존성을 설치하는 중..."
    npm install
fi

# 인자가 있으면 특정 작업 실행, 없으면 기본 분석 실행
if [ $# -eq 0 ]; then
    echo "🎯 iOS 자동 성능 최적화 시스템 시작..."
    echo "📊 4개 서브에이전트 동시 실행: ios-performance, tca-optimizer, swiftui-auditor, clean-architecture"
    npm start
else
    echo "🎯 맞춤 최적화 실행: $*"
    npm start "$*"
fi