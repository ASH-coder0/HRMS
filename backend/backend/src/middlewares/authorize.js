const CustomErrorHandler = require('../utils/CustomErrorHandler');

// Usage: authorize(ROLES.SUPER_ADMIN, ROLES.HR_MANAGER)
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return next(CustomErrorHandler.unAuthorized());
    if (!allowedRoles.includes(req.user.role)) {
      return next(CustomErrorHandler.forbidden());
    }
    next();
  };
};

module.exports = authorize;
