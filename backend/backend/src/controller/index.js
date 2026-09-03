const authController = require('./authController');
const employeeController = require('./employeeController');
const departmentController = require('./departmentController');
const designationController = require('./designationController');
const attendanceController = require('./attendanceController');
const leaveController = require('./leaveController');
const dashboardController = require('./dashboardController');
const  shiftController = require('./shiftController');
const  salaryController = require('./salaryController');
const recurimentController = require('./recurimentController')
const trainingController = require("./trainingController");
const economicYearController = require('./economicYearController');
const payrollController = require('./payrollController')
const payRollEmployeeDetailController = require('./payRollEmployeeDetailController')

module.exports = {
  authController,
  employeeController,
  departmentController,
  designationController,
  attendanceController,
  leaveController,
  dashboardController,
  shiftController,
  salaryController,
  recurimentController,
  trainingController,
  economicYearController,
  payrollController,
  payRollEmployeeDetailController
};
