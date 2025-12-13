require('dotenv').config();
const aiService = require('./services/ai-service');

async function testAI() {
  console.log('🤖 Testing AI Service Integration\n');

  // Show available models
  console.log('📋 Available Models:');
  const models = aiService.getAvailableModels();
  models.forEach(model => {
    console.log(`  - ${model.name} (${model.provider}) [key: ${model.key}]`);
  });
  console.log('');

  if (models.length === 0) {
    console.log('❌ No API keys configured!');
    console.log('Please set GEMINI_API_KEY or OPENAI_API_KEY in .env file\n');
    return;
  }

  // Test with Gemini 2.0 Flash (FREE!)
  const testModel = models.find(m => m.key === 'gemini-2.0-flash')?.key || models[0].key;
  const modelInfo = models.find(m => m.key === testModel);
  console.log(`✅ Testing with ${modelInfo.name} (${modelInfo.provider}) - COMPLETELY FREE!\n`);

  try {
    // Test 1: Simple text generation
    console.log('Test 1: Simple Text Generation');
    console.log('Prompt: "What are the top 3 tourist attractions in Paris?"');
    const response1 = await aiService.generateText(
      'What are the top 3 tourist attractions in Paris? Be concise.',
      testModel
    );
    console.log('Response:', response1.substring(0, 200) + '...\n');

    // Test 2: Travel recommendations
    console.log('Test 2: Travel Recommendations');
    console.log('Destination: Tokyo');
    const response2 = await aiService.generateTravelRecommendations(
      'Tokyo',
      { budget: 'moderate', duration: '5 days', interests: 'culture, food' },
      testModel
    );
    console.log('Response:', response2.substring(0, 300) + '...\n');

    // Test 3: Itinerary generation
    console.log('Test 3: Itinerary Generation');
    console.log('Destination: Barcelona, Days: 3');
    const response3 = await aiService.generateItinerary(
      'Barcelona',
      3,
      { budget: 'moderate', pace: 'relaxed' },
      testModel
    );
    console.log('Response:', response3.substring(0, 300) + '...\n');

    // Test 4: Chat
    console.log('Test 4: Chat Interaction');
    const chatMessages = [
      { role: 'user', content: 'I want to visit Japan. What season is best?' }
    ];
    const response4 = await aiService.chat(chatMessages, testModel);
    console.log('Response:', response4.substring(0, 200) + '...\n');

    console.log('✅ All tests passed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
  }
}

// Run tests
testAI();
