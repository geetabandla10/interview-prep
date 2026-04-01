require('dotenv').config();
const aiService = require('./src/utils/aiService');

async function testAIService() {
  console.log('Testing AI Question Generation...');
  try {
    const questions = await aiService.generateQuestions('Frontend Developer', 'HARD', 'Startup');
    console.log('Generated Questions:', JSON.stringify(questions, null, 2));
    
    if (questions.length >= 5 && questions.length <= 10) {
      console.log('✅ Success: Generated ' + questions.length + ' questions.');
    } else {
      console.log('❌ Failure: Generated ' + questions.length + ' questions (expected 5-10).');
    }
  } catch (error) {
    console.error('❌ Error during AI generation:', error.message);
  }
}

testAIService();
