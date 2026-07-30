const { JWT_SECRET } = require('../config/constant');
const logger = require('../config/winstonLoggerConfig');
const { jwtServices } = require('../services');
const CustomErrorHandler = require('../utils/CustomErrorHandler');

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next(CustomErrorHandler.unAuthorized());

  const token = authHeader.split(' ')[1];

  try {
    const { user_id, email, role, employee_id } = jwtServices.verify(token, JWT_SECRET);
    req.user = { user_id, email, role, employee_id };
    next();
  } catch (error) {
    logger.error(`{Api:${req.url}, Error:${error.message}, stack:${error.stack} }`);
    return next(CustomErrorHandler.unAuthorized('Invalid or expired token'));
  }
};

module.exports = auth;
