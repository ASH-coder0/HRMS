const logger = require('../config/winstonLoggerConfig');

const asyncHandler = (handler) => {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      logger.error(`{Api:${req.url}, Error:${error.message}, stack:${error.stack} }`);
      return next(error);
    }
  };
};

module.exports = asyncHandler;
