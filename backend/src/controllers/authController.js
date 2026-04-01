const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    // 1. Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
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
    res.status(500).json({ error: 'Authentication failed' });
  }
};

module.exports = {
  googleLogin,
};
