const jwt = require('jsonwebtoken');

/**
 * Verify JWT token from Authorization header
 */
const verifyToken = (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable not set!');
    return null;
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Middleware to protect routes - returns 401 if no valid token
 */
const requireAuth = (handler) => {
  return async (req, res) => {
    const decoded = verifyToken(req);
    
    if (!decoded || !decoded.admin) {
      return res.status(401).json({ error: 'Unauthorized - Invalid or missing token' });
    }
    
    // Attach decoded token to request for use in handler
    req.user = decoded;
    
    return handler(req, res);
  };
};

/**
 * Optional auth - attaches user if token valid, but doesn't reject request
 */
const optionalAuth = (handler) => {
  return async (req, res) => {
    const decoded = verifyToken(req);
    
    if (decoded) {
      req.user = decoded;
    }
    
    return handler(req, res);
  };
};

module.exports = {
  verifyToken,
  requireAuth,
  optionalAuth
};
