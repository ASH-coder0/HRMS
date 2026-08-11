const jwtServices = require('./jwtServices');
const emailServices = require('./emailServices');
const authServices = require('./authServices');
const employeeServices = require('./employeeServices');
const departmentServices = require('./departmentServices');
const designationServices = require('./designationServices');
const attendanceServices = require('./attendanceServices');
const leaveServices = require('./leaveServices');
const dashboardServices = require('./dashboardServices');
const notifications = require('./notificationServices')
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
};
