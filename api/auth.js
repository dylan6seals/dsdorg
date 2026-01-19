const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Set CORS headers helper
const setCorsHeaders = (res) => {
  const origin = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NODE_ENV === 'production'
    ? 'https://dylanseals.org'
    : '*';
    
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
};

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }
      
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
      
      if (!ADMIN_PASSWORD) {
        console.error('ADMIN_PASSWORD environment variable not set!');
        return res.status(500).json({ error: 'Server configuration error' });
      }
      
      // Check if password is hashed (starts with $2a$ or $2b$ for bcrypt)
      let isValid = false;
      
      if (ADMIN_PASSWORD.startsWith('$2a$') || ADMIN_PASSWORD.startsWith('$2b$')) {
        // Compare with hashed password
        isValid = await bcrypt.compare(password, ADMIN_PASSWORD);
      } else {
        // Direct comparison for plain text (development only)
        isValid = password === ADMIN_PASSWORD;
        
        if (process.env.NODE_ENV === 'production') {
          console.warn('WARNING: Using plain text password in production!');
        }
      }

      if (isValid) {
        const token = jwt.sign(
          { admin: true, timestamp: Date.now() },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );

        return res.status(200).json({
          success: true,
          token
        });
      }

      // Add small delay to prevent brute force
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return res.status(401).json({ error: 'Invalid password' });
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(500).json({ error: 'Authentication failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
