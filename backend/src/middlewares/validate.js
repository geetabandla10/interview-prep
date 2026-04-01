const { body, param, validationResult } = require('express-validator');

/**
 * Middleware to check for validation errors from express-validator.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array().map(e => e.msg) });
  }
  next();
};

/**
 * Strips HTML tags from a string to prevent XSS.
 */
const stripHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '').trim();
};

/**
 * Middleware that sanitizes all string fields in req.body.
 */
const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = stripHtml(req.body[key]);
      }
    }
  }
  next();
};

// ─── Validation Rules ────────────────────────────────────────────────────────

const validateGoogleLogin = [
  body('credential')
    .notEmpty().withMessage('Google credential is required')
    .isString().withMessage('Credential must be a string'),
  handleValidationErrors,
];

const validateStartSession = [
  body('role')
    .notEmpty().withMessage('Role is required')
    .isString().withMessage('Role must be a string')
    .isLength({ max: 100 }).withMessage('Role must be under 100 characters'),
  body('difficulty')
    .notEmpty().withMessage('Difficulty is required')
    .isIn(['EASY', 'MEDIUM', 'HARD']).withMessage('Difficulty must be EASY, MEDIUM, or HARD'),
  body('companyType')
    .optional()
    .isString().withMessage('Company type must be a string')
    .isLength({ max: 100 }).withMessage('Company type must be under 100 characters'),
  handleValidationErrors,
];

const validateSubmitAnswer = [
  body('sessionId')
    .notEmpty().withMessage('Session ID is required')
    .isUUID().withMessage('Session ID must be a valid UUID'),
  body('questionId')
    .notEmpty().withMessage('Question ID is required')
    .isUUID().withMessage('Question ID must be a valid UUID'),
  body('userAnswer')
    .notEmpty().withMessage('Answer is required')
    .isString().withMessage('Answer must be a string')
    .isLength({ max: 5000 }).withMessage('Answer must be under 5000 characters'),
  handleValidationErrors,
];

const validateGenerateQuestions = [
  body('role')
    .notEmpty().withMessage('Role is required')
    .isString().withMessage('Role must be a string'),
  body('difficulty')
    .notEmpty().withMessage('Difficulty is required')
    .isIn(['EASY', 'MEDIUM', 'HARD']).withMessage('Difficulty must be EASY, MEDIUM, or HARD'),
  handleValidationErrors,
];

const validateSessionId = [
  param('id')
    .isUUID().withMessage('Session ID must be a valid UUID'),
  handleValidationErrors,
];

module.exports = {
  sanitizeBody,
  validateGoogleLogin,
  validateStartSession,
  validateSubmitAnswer,
  validateGenerateQuestions,
  validateSessionId,
};
