const Joi = require('joi');

const passwordSchema = Joi.string()
  .min(8)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required',
  });

const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),

    password: passwordSchema,
  });

  const { error } = schema.validate(req.body);

  if (error) return next(error);

  next();
};

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) return next(error);

  next();
};

const validateRefreshToken = (req, res, next) => {
  const schema = Joi.object({
    refresh_token: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) return next(error);

  next();
};

const validateForgotPassword = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) return next(error);

  next();
};

const validateResetPassword = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    token: Joi.string().required(),
    new_password: passwordSchema,
  });

  const { error } = schema.validate(req.body);

  if (error) return next(error);

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateForgotPassword,
  validateResetPassword,
};
