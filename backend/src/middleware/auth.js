const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { error } = require('../utils/response');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) return error(res, 'Not authenticated', 401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) return error(res, 'User not found or inactive', 401);
    req.user = user;
    next();
  } catch {
    return error(res, 'Invalid or expired token', 401);
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return error(res, 'Admin access required', 403);
  }
  next();
};

module.exports = { protect, requireAdmin };
