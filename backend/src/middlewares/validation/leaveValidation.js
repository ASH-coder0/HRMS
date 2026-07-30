const Joi = require('joi');

const validateApplyLeave = (req, res, next) => {
  const schema = Joi.object({
    employee_id: Joi.number().integer().optional(),
    leave_type_id: Joi.number().integer().required(),
    start_date: Joi.date().required(),
    end_date: Joi.date().required(),
    reason: Joi.string().optional().allow(null, ''),
  });
  const { error } = schema.validate(req.body);
  if (error) return next(error);
  next();
};

const validateRejectLeave = (req, res, next) => {
  const schema = Joi.object({
    reason: Joi.string().optional().allow(null, ''),
  });
  const { error } = schema.validate(req.body);
  if (error) return next(error);
  next();
};

module.exports = { validateApplyLeave, validateRejectLeave };
