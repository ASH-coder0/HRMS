const auth = require('./auth');
const authorize = require('./authorize');
const asyncHandler = require('./asyncHandler');
const rateLimiter = require('./rateLimiter');

const authValidation = require('./validation/authValidation');
const employeeValidation = require('./validation/employeeValidation');
const departmentValidation = require('./validation/departmentValidation');
const designationValidation = require('./validation/designationValidation');
const attendanceValidation = require('./validation/attendanceValidation');
const leaveValidation = require('./validation/leaveValidation');

module.exports = {
  auth,
  authorize,
  asyncHandler,
  rateLimiter,
  authValidation,
  employeeValidation,
  departmentValidation,
  designationValidation,
  attendanceValidation,
  leaveValidation,
};
