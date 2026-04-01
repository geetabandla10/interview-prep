const express = require('express');
const router = express.Router();
const { 
  startSession, 
  submitAnswer, 
  getUserSessions, 
  getSessionDetails,
  generateQuestionsOnly 
} = require('../controllers/interviewController');
const { verifyToken } = require('../middlewares/authMiddleware');
const {
  validateStartSession,
  validateSubmitAnswer,
  validateGenerateQuestions,
  validateSessionId,
} = require('../middlewares/validate');

// All interview routes are protected
router.use(verifyToken);

router.post('/start', validateStartSession, startSession);
router.post('/generate-questions', validateGenerateQuestions, generateQuestionsOnly);
router.post('/submit', validateSubmitAnswer, submitAnswer);
router.get('/history', getUserSessions);
router.get('/:id', validateSessionId, getSessionDetails);

module.exports = router;
