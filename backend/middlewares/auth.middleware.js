const jwt = require('jsonwebtoken');

const badResponse = {
  success: false,
  err: '',
  data: {},
  msg: 'Authentication required',
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json(badResponse);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = { id: decoded.id, role: decoded.role };
    return next();
  } catch (err) {
    return res.status(401).json({ ...badResponse, err: 'invalid or expired token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, err: 'forbidden', data: {}, msg: 'admin only' });
  }
  return next();
};

module.exports = { verifyToken, requireAdmin };
