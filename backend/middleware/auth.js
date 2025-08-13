const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  // Check if token starts with "Bearer "
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}; 