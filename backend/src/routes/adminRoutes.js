const express = require('express');
const router = express.Router();
const { getAllUsers, getGlobalStats } = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');

// All admin routes are protected by both JWT and Admin verification
router.use(verifyToken);
router.use(verifyAdmin);

// Fetch all users and their performance stats
router.get('/users', getAllUsers);

// Fetch global stats aggregated by date for trends
router.get('/stats', getGlobalStats);

module.exports = router;
