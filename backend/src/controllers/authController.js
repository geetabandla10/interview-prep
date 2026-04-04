const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

// Use .trim() to prevent invisible space/newline errors from .env loading
const googleClientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
const client = new OAuth2Client(googleClientId);

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    // 1. Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture: profilePic } = payload;

    // 2. Create or fetch user from DB
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          googleId,
          profilePic,
        },
      });
    } else if (!user.googleId) {
      // Connect existing email user to google auth
      user = await prisma.user.update({
        where: { email },
        data: { googleId, profilePic },
      });
    }

    // 3. Generate custom JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 4. Return token and user data
    res.status(200).json({
      message: 'Login successful',
      token,
      user,
    });
  } catch (error) {
    console.error('Error during Google Login:', error);
    
    // Provide a more descriptive error message in development/deployment phase
    let errorMessage = 'Authentication failed';
    if (error.message && error.message.includes('Can\'t reach database server')) {
      errorMessage = 'Database connection failed. Please check your DATABASE_URL in Vercel.';
    } else if (error.message && error.message.includes('Wrong recipient')) {
      errorMessage = 'Invalid Google Client ID. Please check your GOOGLE_CLIENT_ID in Vercel.';
    } else {
      errorMessage = `Login error: ${error.message || 'Internal Server Error'}`;
    }

    res.status(500).json({ error: errorMessage });
  }
};

const demoLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email !== 'demo@example.com' || password !== 'demo123') {
      return res.status(401).json({ error: 'Invalid demo credentials' });
    }

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: 'Demo User',
          profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Demo login successful',
      token,
      user,
    });
  } catch (error) {
    console.error('Error during Demo Login:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

module.exports = {
  googleLogin,
  demoLogin,
};
