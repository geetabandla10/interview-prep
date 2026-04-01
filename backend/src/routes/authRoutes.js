const express = require('express');
const { googleLogin } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { validateGoogleLogin } = require('../middlewares/validate');

const router = express.Router();

// POST /api/auth/google
router.post('/google', validateGoogleLogin, googleLogin);

// Protected route for testing
router.get('/me', verifyToken, (req, res) => {
  res.json({ message: 'Protected resource accessed successfully', userId: req.user.id });
});

module.exports = router;
