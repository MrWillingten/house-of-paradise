const axios = require('axios');

const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://localhost:3004';

// Verify JWT token middleware
async function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization;
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Verify token with auth service
    const response = await axios.get(`${AUTH_SERVICE}/api/auth/verify`, {
      headers: { Authorization: token }
    });

    if (response.data.success) {
      req.user = response.data.data.user;
      next();
    } else {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
}

// Check if user is admin
function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
}

module.exports = { verifyToken, isAdmin };