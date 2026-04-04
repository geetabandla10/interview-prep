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
const requiredSecrets = ['DATABASE_URL', 'JWT_SECRET', 'GOOGLE_CLIENT_ID'];
requiredSecrets.forEach(secret => {
  if (!process.env[secret]) {
    console.warn(`WARNING: ${secret} is NOT set in environment variables!`);
  }
});

const app = express();
const port = process.env.PORT || 5000;

// ─── Security Middlewares ────────────────────────────────────────────────────

// Security headers (disable CSP for SPA serving)
app.use(helmet({ contentSecurityPolicy: false }));

// CORS - allow localhost and vercel domains
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.includes('localhost') || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS Error: Origin ${origin} not allowed`));
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

// Mount routes - handling both prefixed and non-prefixed for Vercel Services compatibility
const mountRoutes = (prefix) => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/interviews`, interviewRoutes);
  app.use(`${prefix}/admin`, adminRoutes);
};

mountRoutes('/api'); // Local dev & Legacy
mountRoutes('');     // Vercel Services (where /api is stripped)

// Health check with environment status (masked secrets)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AI Interview Prep Coach API (Serverless) is running',
    environment: process.env.NODE_ENV,
    configStatus: {
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      googleClientIdPrefix: process.env.GOOGLE_CLIENT_ID ? `${process.env.GOOGLE_CLIENT_ID.slice(0, 6)}...` : 'not set',
    }
  });
});

// Serve static files from the React frontend app if needed (optional for Vercel functions, but keeping consistency)
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// API catch-all (404 for undefined API routes)
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// SPA catch-all (important for routing)
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith('/api')) { return next(); }
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
