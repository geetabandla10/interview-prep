const { OpenAI } = require('openai');

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "AI Interview Prep Coach",
  },
});

const DEFAULT_MODEL = "google/gemini-2.0-flash-lite-001";

const MOCK_QUESTIONS = {
  "Frontend Developer": [
    "Explain the difference between virtual DOM and real DOM.",
    "What are React hooks, and why were they introduced?",
    "How do you optimize a React application's performance?",
    "Explain the concepts of ‘lifting state up’ in React.",
    "What is the significance of keys in React lists?"
  ],
  "Backend Developer": [
    "What is the difference between SQL and NoSQL databases?",
    "Explain the concept of RESTful APIs.",
    "What is middleware in the context of Express.js?",
    "How do you handle authentication in a Node.js application?",
    "What are the advantages of using JWT for authentication?"
  ],
  "Data Analyst": [
    "What is the difference between data mining and data profiling?",
    "How do you handle missing or corrupted data in a dataset?",
    "Explain the concept of a subquery in SQL.",
    "What is a pivot table, and how is it useful?",
    "What are the main differences between Python and R for data analysis?"
  ],
  "General": [
    "Tell me about yourself.",
    "Why do you want to work for this company?",
    "What are your strengths and weaknesses?",
    "Where do you see yourself in five years?",
    "Describe a challenging situation you've faced at work and how you handled it."
  ]
};

/**
 * Generates 5-10 interview questions based on role, difficulty, and company type.
 */
const generateQuestions = async (role, difficulty, companyType) => {
  const shouldUseMock = process.env.USE_MOCK_AI === 'true';
  const systemPrompt = `You are an interview coach for ${role}. Generate ${difficulty} level interview questions for a ${companyType || 'General'} company. Return 5-10 questions in JSON format.`;
  const userPrompt = `Generate a JSON array of strings containing 5 to 10 unique, challenging interview questions. Example format: ["Question 1", "Question 2", ...].`;

  if (!shouldUseMock) {
    try {
      const response = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
      });

      const content = JSON.parse(response.choices[0].message.content);
      const questionsList = Array.isArray(content) ? content : Object.values(content).find(v => Array.isArray(v)) || [];
      if (questionsList.length >= 5) return questionsList;
    } catch (error) {
      console.error("AI Question Generation Error (Falling back to Mock):", error.message);
    }
  }

  // Fallback to Mock Data
  console.log(`Using Mock questions for role: ${role}`);
  return MOCK_QUESTIONS[role] || MOCK_QUESTIONS["General"];
};

/**
 * Evaluates a user's answer and provides a score and feedback.
 */
const evaluateAnswer = async (question, userAnswer) => {
  const shouldUseMock = process.env.USE_MOCK_AI === 'true';
  const prompt = `
    Evaluate the following interview answer. Return JSON:
    {
      "score": number (1-10),
      "good": "string (Key strengths of the answer)",
      "missing": "string (What was missing or could be improved)",
      "ideal": "string (The ideal version of the answer)"
    }
    
    Question: ${question}
    User's Answer: ${userAnswer}
  `;

  if (!shouldUseMock) {
    try {
      const response = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error("AI Evaluation Error (Falling back to Mock):", error.message);
    }
  }

  // Fallback to Mock Evaluation
  return {
    score: 8.5,
    good: "The answer shows a solid understanding of the core concepts and provides a clear explanation.",
    missing: "Could have included more specific real-world examples or technical details to further strengthen the answer.",
    ideal: "A more comprehensive answer would involve explaining the underlying architecture and providing specific use cases or performance benchmarks."
  };
};

/**
 * Generates an overall summary of an entire interview session.
 */
const generateOverallSummary = async (questionsAndAnswers) => {
  const shouldUseMock = process.env.USE_MOCK_AI === 'true';
  const prompt = `
    Based on the following interview session (questions and answers), provide an overall summary.
    Return JSON:
    {
      "summaryGood": "string (Overall strengths across all answers)",
      "summaryMissing": "string (Main areas for improvement across all answers)"
    }
    
    Session Data:
    ${JSON.stringify(questionsAndAnswers, null, 2)}
  `;

  if (!shouldUseMock) {
    try {
      const response = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error("AI Summary Generation Error (Falling back to Mock):", error.message);
    }
  }

  // Fallback
  return {
    summaryGood: "Overall, you demonstrated strong technical knowledge and expressed your ideas clearly. Your communication style is professional and engaging.",
    summaryMissing: "To improve, try to weave in more specific metrics or outcomes from your past projects. Some answers could benefit from a more structured framework like STAR."
  };
};

module.exports = {
  generateQuestions,
  evaluateAnswer,
  generateOverallSummary,
};
