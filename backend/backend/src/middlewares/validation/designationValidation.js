const Joi = require('joi');

const validateCreateDesignation = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    department_id: Joi.number().integer().required(),
    level: Joi.string().optional().allow(null, ''),
  });
  const { error } = schema.validate(req.body);
  if (error) return next(error);
  next();
};

const validateUpdateDesignation = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().optional(),
    department_id: Joi.number().integer().optional(),
    level: Joi.string().optional().allow(null, ''),
    is_active: Joi.boolean().optional(),
  });
  const { error } = schema.validate(req.body);
  if (error) return next(error);
  next();
};

module.exports = { validateCreateDesignation, validateUpdateDesignation };
