const { asyncHandler } = require('../middlewares');
const { attendanceServices } = require('../services');
const { SUCCESS_API_FETCH, DATA_SAVED, DATA_UPDATED } = require('../helpers/response');

const checkIn = asyncHandler(async (req, res) => {
  const employeeId = req.body.employee_id || req.user.employee_id;
  const data = await attendanceServices.checkIn(employeeId);
  return res.status(200).json(DATA_UPDATED(data, 'Checked in successfully'));
});

const checkOut = asyncHandler(async (req, res) => {
  const employeeId = req.body.employee_id || req.user.employee_id;
  const data = await attendanceServices.checkOut(employeeId);
  return res.status(200).json(DATA_UPDATED(data, 'Checked out successfully'));
});
const hoursWorked = async (employeeId) => {
  const records = await Attendance.findAll({
    where: {
      employee_id: employeeId,
    },
    order: [['date', 'DESC']],
  });

  const totalHours = records.reduce((total, record) => {
    return total + Number(record.total_hour || 0);
  }, 0);

  return {
    employee_id: employeeId,
    total_hour: Number(totalHours.toFixed(2)),
    records,
  };
};
const manualEntry = asyncHandler(async (req, res) => {
  const data = await attendanceServices.manualEntry(req.body);
  return res.status(200).json(DATA_SAVED(data, 'Attendance recorded'));
});

const getAll = asyncHandler(async (req, res) => {
  const data = await attendanceServices.getAll(req.query, req.user.role);
  return res.status(200).json(SUCCESS_API_FETCH(data, 'Attendance records fetched successfully'));
});

const monthlyReport = asyncHandler(async (req, res) => {
  const data = await attendanceServices.monthlyReport(req.query);
  return res.status(200).json(SUCCESS_API_FETCH(data, 'Monthly attendance report fetched successfully'));
});

module.exports = { checkIn, checkOut, manualEntry, getAll, monthlyReport,hoursWorked};
