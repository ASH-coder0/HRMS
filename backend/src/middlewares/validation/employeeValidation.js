const Joi = require('joi');
const { EMPLOYEE_STATUS, EMPLOYMENT_TYPE } = require('../../constant');

const validateCreateEmployee = (req, res, next) => {
  const schema = Joi.object({
    employee_code: Joi.string().required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().optional().allow(null, ''),
    citizenship_number: Joi.string().optional().allow(null, ''),
    gender: Joi.string().valid('male', 'female', 'other').optional().allow(null, ''),
    date_of_birth: Joi.date().optional().allow(null, ''),
    date_of_joining: Joi.date().required(),
    department_id: Joi.number().integer().required(),
    designation_id: Joi.number().integer().required(),
    role_id: Joi.number().integer().required(),
    employment_type: Joi.string().valid(...EMPLOYMENT_TYPE).optional(),
    status: Joi.string().valid(...EMPLOYEE_STATUS).optional(),
    address: Joi.string().optional().allow(null, ''),
    blood_group: Joi.string().optional().allow(null, ''),
  });
  const { error } = schema.validate(req.body);
  if (error) return next(error);
  next();
};

const validateUpdateEmployee = (req, res, next) => {
  const schema = Joi.object({
    employee_code: Joi.string().optional(),
    first_name: Joi.string().optional(),
    last_name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional().allow(null, ''),
    citizenship_number: Joi.string().optional().allow(null, ''),
    gender: Joi.string().valid('male', 'female', 'other').optional().allow(null, ''),
    date_of_birth: Joi.date().optional().allow(null, ''),
    date_of_joining: Joi.date().optional(),
    department_id: Joi.number().integer().optional(),
    designation_id: Joi.number().integer().optional(),
    role_id: Joi.number().integer().optional(),
    employment_type: Joi.string().valid(...EMPLOYMENT_TYPE).optional(),
    status: Joi.string().valid(...EMPLOYEE_STATUS).optional(),
     address: Joi.string().optional().allow(null, ''),
    blood_group: Joi.string().optional().allow(null, ''),
  });
  const { error } = schema.validate(req.body);
  if (error) return next(error);
  next();
};

module.exports = { validateCreateEmployee, validateUpdateEmployee };