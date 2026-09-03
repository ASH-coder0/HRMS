const { ValidationError } = require('joi');
const CustomErrorHandler = require('./CustomErrorHandler');
const { NODE_ENV } = require('../config/constant');

const errorHandler = (err, req, res, next) => {
  // default error
  let statusCode = 500;
  let data = {
    status: false,
    message: 'Internal Server Error',
    ...(NODE_ENV === 'development' && { originalMessage: err.message }),
  };

  // Joi validation error
  if (err instanceof ValidationError) {
    statusCode = 400;
    data = { status: false, message: err.details?.[0]?.message || err.message };
  }

  // Application-level error
  if (err instanceof CustomErrorHandler) {
    statusCode = err.status;
    data = { status: false, message: err.message };
  }

  // Sequelize unique constraint / validation errors
  if (err.name === 'SequelizeUniqueConstraintError' || err.name === 'SequelizeValidationError') {
    statusCode = 400;
    data = { status: false, message: err.errors?.[0]?.message || 'Validation error' };
  }

  res.status(statusCode).json(data);
};

module.exports = errorHandler;
