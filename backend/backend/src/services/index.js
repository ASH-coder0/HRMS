const jwtServices = require("./jwtServices");
const emailServices = require("./emailServices");
const authServices = require("./authServices");
const employeeServices = require("./employeeServices");
const departmentServices = require("./departmentServices");
const designationServices = require("./designationServices");
const attendanceServices = require("./attendanceServices");
const leaveServices = require("./leaveServices");
const dashboardServices = require("./dashboardServices");
const notifications = require("./notificationServices");
const shiftServices = require("./shiftServices");
const salaryServices = require("./salaryService");
const recurimentServices = require("./recurimentServices");
const trainingServices = require("./traininngServices");
const economicYearServices = require('./economicYearServices');
const payRoleService = require('./payRoleService')
const payRoleEmployeeDetailService = require('./payRollEmployeeDetailServices')

module.exports = {
  jwtServices,
  emailServices,
  authServices,
  employeeServices,
  departmentServices,
  designationServices,
  attendanceServices,
  leaveServices,
  dashboardServices,
  notifications,
  shiftServices,
  salaryServices,
  recurimentServices,
  trainingServices,
  economicYearServices,
  payRoleService,
  payRoleEmployeeDetailService
};
