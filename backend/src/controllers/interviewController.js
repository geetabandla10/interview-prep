const prisma = require('../utils/prisma');
const aiService = require('../utils/aiService');

/**
 * Starts a new interview session and generates questions.
 */
const startSession = async (req, res) => {
  try {
    const { role, difficulty, companyType } = req.body;
    const userId = req.user.id; // From verifyToken middleware

    if (!role || !difficulty) {
      return res.status(400).json({ error: 'Role and difficulty are required' });
    }

    // 1. Create the session in the database
    const session = await prisma.session.create({
      data: {
        userId,
        role,
        difficulty,
        companyType,
      },
    });

    // 2. Generate 5 questions using AI
    const questionsList = await aiService.generateQuestions(role, difficulty, companyType);

    // 3. Create question records linked to the session
    const questionPromises = questionsList.slice(0, 5).map((qText) => {
      return prisma.question.create({
        data: {
          sessionId: session.id,
          questionText: qText,
        },
      });
    });

    await Promise.all(questionPromises);

    // 4. Fetch the session with its newly created questions
    const fullSession = await prisma.session.findUnique({
      where: { id: session.id },
      include: { questions: true },
    });

    res.status(201).json(fullSession);
  } catch (error) {
    console.error('Error starting interview session:', error);
    res.status(500).json({ error: 'Failed to start interview session' });
  }
};

/**
 * Submits a user answer for a specific question and evaluates it.
 */
const submitAnswer = async (req, res) => {
  try {
    const { sessionId, questionId, userAnswer } = req.body;

    if (!sessionId || !questionId || !userAnswer) {
      return res.status(400).json({ error: 'Session ID, question ID, and user answer are required' });
    }

    // 1. Fetch the question text for evaluation
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // 2. Evaluate answer using AI
    const evaluation = await aiService.evaluateAnswer(question.questionText, userAnswer);

    // 3. Save the answer record
    const savedAnswer = await prisma.answer.create({
      data: {
        questionId: question.id,
        userAnswer,
        score: evaluation.score,
        good: evaluation.good,
        missing: evaluation.missing,
        ideal: evaluation.ideal,
      },
    });

    // 4. Update the session total score (average of completed questions so far)
    const allAnswers = await prisma.answer.findMany({
      where: { question: { sessionId } },
    });

    const averageScore = allAnswers.reduce((sum, ans) => sum + ans.score, 0) / allAnswers.length;

    await prisma.session.update({
      where: { id: sessionId },
      data: { totalScore: averageScore },
    });

    res.status(201).json(savedAnswer);
  } catch (error) {
    console.error('Error submitting user answer:', error);
    res.status(500).json({ error: 'Failed to submit and evaluate answer' });
  }
};

/**
 * Fetches all interview sessions for the logged-in user.
 */
const getUserSessions = async (req, res) => {
  try {
    const userId = req.user.id;

    const sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
         _count: {
           select: { questions: true }
         }
      }
    });

    res.status(200).json(sessions);
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({ error: 'Failed to fetch interview history' });
  }
};

/**
 * Fetches full session details, including questions and answers.
 */
const getSessionDetails = async (req, res) => {
  try {
     const { id } = req.params;
     
     let session = await prisma.session.findUnique({
        where: { id },
        include: {
           questions: {
              include: { answer: true }
           }
        }
     });

     if (!session) {
        return res.status(404).json({ error: 'Session not found' });
     }

     // Generate summary if it doesn't exist and all questions are answered
     const allQuestionsAnswered = session.questions.every(q => q.answer);
     if (allQuestionsAnswered && (!session.summaryGood || !session.summaryMissing)) {
        const qaData = session.questions.map(q => ({
           question: q.questionText,
           answer: q.answer.userAnswer,
           score: q.answer.score,
           good: q.answer.good,
           missing: q.answer.missing
        }));

        const summary = await aiService.generateOverallSummary(qaData);

        session = await prisma.session.update({
           where: { id },
           data: {
              summaryGood: summary.summaryGood,
              summaryMissing: summary.summaryMissing
           },
           include: {
              questions: {
                 include: { answer: true }
              }
           }
        });
     }

     res.status(200).json(session);
  } catch (error) {
     console.error('Error fetching session details:', error);
     res.status(500).json({ error: 'Failed to fetch session details' });
  }
}

const generateQuestionsOnly = async (req, res) => {
  try {
    const { role, difficulty, companyType } = req.body;

    if (!role || !difficulty) {
      return res.status(400).json({ error: 'Role and difficulty are required' });
    }

    const questionsList = await aiService.generateQuestions(role, difficulty, companyType);

    res.status(200).json({ questions: questionsList });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: 'Failed to generate interview questions' });
  }
};

module.exports = {
  startSession,
  submitAnswer,
  getUserSessions,
  getSessionDetails,
  generateQuestionsOnly
};
