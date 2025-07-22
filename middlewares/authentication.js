const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'wdp301-super-secret-jwt-key-2025-secure';

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ success: false, message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Invalid token format' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // <--- userId sẽ nằm ở đây nếu bạn sign đúng payload
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};