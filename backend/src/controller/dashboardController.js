const { asyncHandler } = require('../middlewares');
const { dashboardServices } = require('../services');
const { SUCCESS_API_FETCH } = require('../helpers/response');

const getCards = asyncHandler(async (req, res) => {
  const data = await dashboardServices.getCards();
  return res.status(200).json(SUCCESS_API_FETCH(data, 'Dashboard cards fetched successfully'));
});

const getAttendanceTrend = asyncHandler(async (req, res) => {
  const data = await dashboardServices.getAttendanceTrend(Number(req.query.days) || 14);
  return res.status(200).json(SUCCESS_API_FETCH(data, 'Attendance trend fetched successfully'));
});

const getDepartmentDistribution = asyncHandler(async (req, res) => {
  const data = await dashboardServices.getDepartmentDistribution();
  return res.status(200).json(SUCCESS_API_FETCH(data, 'Department distribution fetched successfully'));
});

const getPayrollExpense = asyncHandler(async (req, res) => {
  const data = await dashboardServices.getPayrollExpense();
  return res.status(200).json(SUCCESS_API_FETCH(data, 'Payroll expense fetched successfully'));
});

const getGenderDistribution = asyncHandler(async (req, res) => {
  const data = await dashboardServices.getGenderDistribution();
  return res.status(200).json(SUCCESS_API_FETCH(data, 'Gender distribution fetched successfully'));
});

const getMonthlyRecruitment = asyncHandler(async (req, res) => {
  const data = await dashboardServices.getMonthlyRecruitment();
  return res.status(200).json(SUCCESS_API_FETCH(data, 'Monthly recruitment fetched successfully'));
});

const getLeaveStatistics = asyncHandler(async (req, res) => {
  const data = await dashboardServices.getLeaveStatistics();
  return res.status(200).json(SUCCESS_API_FETCH(data, 'Leave statistics fetched successfully'));
});

const getRecentActivity = asyncHandler(async (req, res) => {
  const data = await dashboardServices.getRecentActivity();
  return res.status(200).json(SUCCESS_API_FETCH(data, 'Recent activity fetched successfully'));
});

module.exports = {
  getCards, getAttendanceTrend, getDepartmentDistribution, getPayrollExpense,
  getGenderDistribution, getMonthlyRecruitment, getLeaveStatistics, getRecentActivity,
};
