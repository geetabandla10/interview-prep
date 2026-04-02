const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sanitizeBody } = require('./middlewares/validate');

// Load environment variables
dotenv.config();

// Fail fast if critical secrets are missing
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set in .env');
  process.exit(1);
}

if (!process.env.GOOGLE_CLIENT_ID) {
  console.error('WARNING: GOOGLE_CLIENT_ID is not set. Google Login will fail.');
}

const app = express();
const port = process.env.PORT || 5000;

// ─── Security Middlewares ────────────────────────────────────────────────────

// Security headers (disable CSP for SPA serving)
app.use(helmet({ contentSecurityPolicy: false }));

// CORS - restrict to known origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, same-origin)
    if (!origin || allowedOrigins.includes(origin) || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Body parsing with size limit
app.use(express.json({ limit: '1mb' }));

// Global input sanitization
app.use(sanitizeBody);

// Rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', apiLimiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts, please try again later.' },
});
app.use('/api/auth', authLimiter);

// ─── Routes ──────────────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'AI Interview Prep Coach API (Serverless) is running' });
});

// Serve static files from the React frontend app if needed (optional for Vercel functions, but keeping consistency)
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// SPA catch-all (important for routing)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist', 'index.html'));
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Export app for serverless deployment
module.exports = app;

// Start server ONLY if not in a serverless environment (local dev)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
}
