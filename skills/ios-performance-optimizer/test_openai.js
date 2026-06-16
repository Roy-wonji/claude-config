const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function testConnection() {
  try {
    console.log("🔍 OpenAI API 연결 테스트 중...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user", 
          content: "iOS Swift 코드 최적화에서 중요한 3가지 포인트를 간단히 말해줘"
        }
      ],
      max_tokens: 150
    });
    
    console.log("✅ OpenAI API 연결 성공!");
    console.log("📝 Codex 스타일 응답:");
    console.log(response.choices[0].message.content);
    
  } catch (error) {
    console.log("❌ OpenAI API 연결 실패:", error.message);
  }
}

testConnection();
