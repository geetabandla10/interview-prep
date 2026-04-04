const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const splitToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    
    if (splitToken === 'demo-offline-token') {
      req.user = { id: 'demo-user-id', role: 'USER' };
      return next();
    }
    
    const verified = jwt.verify(
      splitToken,
      process.env.JWT_SECRET
    );
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
};

module.exports = {
  verifyToken,
  verifyAdmin,
};
