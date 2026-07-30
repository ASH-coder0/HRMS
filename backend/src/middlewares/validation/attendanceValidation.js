const Joi = require('joi');
const { ATTENDANCE_STATUS } = require('../../constant');

const validateManualEntry = (req, res, next) => {
  const schema = Joi.object({
    employee_id: Joi.number().integer().required(),
    date: Joi.date().required(),
    status: Joi.string().valid(...ATTENDANCE_STATUS).required(),
    check_in: Joi.date().optional().allow(null, ''),
    check_out: Joi.date().optional().allow(null, ''),
    remarks: Joi.string().optional().allow(null, ''),
  });
  const { error } = schema.validate(req.body);
  if (error) return next(error);
  next();
};

module.exports = { validateManualEntry };
