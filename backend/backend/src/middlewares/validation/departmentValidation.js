const Joi = require('joi');

const validateCreateDepartment = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    code: Joi.string().optional().allow(null, ''),
    description: Joi.string().optional().allow(null, ''),
  });
  const { error } = schema.validate(req.body);
  if (error) return next(error);
  next();
};

const validateUpdateDepartment = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().optional(),
    code: Joi.string().optional().allow(null, ''),
    description: Joi.string().optional().allow(null, ''),
    is_active: Joi.boolean().optional(),
  });
  const { error } = schema.validate(req.body);
  if (error) return next(error);
  next();
};

module.exports = { validateCreateDepartment, validateUpdateDepartment };
