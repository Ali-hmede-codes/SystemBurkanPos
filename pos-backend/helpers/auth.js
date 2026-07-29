const jwt = require('jsonwebtoken');
const ApiResponse = require('./apiResponse');

/**
 * Verify JWT token middleware
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ApiResponse.error(res, 'Access denied. No token provided.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return ApiResponse.error(res, 'Invalid or expired token.', 401);
  }
};

/**
 * Role-based access control middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Access denied.', 401);
    }
    if (!roles.includes(req.user.role)) {
      return ApiResponse.error(res, 'Insufficient permissions.', 403);
    }
    next();
  };
};

module.exports = { authMiddleware, authorize };
