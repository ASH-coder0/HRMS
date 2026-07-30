const { Op } = require('sequelize');
const Attendance = require('../../models/Attendance');
const Employee = require('../../models/Employee');
const Department = require('../../models/Department');
const CustomErrorHandler = require('../utils/CustomErrorHandler');
const { getTodayDateOnly } = require('../helpers/date');

const checkIn = async (employeeId) => {
  const date = getTodayDateOnly();
  let record = await Attendance.findOne({ where: { employee_id: employeeId, date } });
  if (record && record.check_in) throw CustomErrorHandler.validationError('Already checked in today');

  const now = new Date();
  const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15);

  if (record) {
    record.check_in = now;
    record.status = isLate ? 'late' : 'present';
    await record.save();
  } else {
    record = await Attendance.create({
      employee_id: employeeId,
      date,
      check_in: now,
      status: isLate ? 'late' : 'present',
    });
  }
  return record;
};

const checkOut = async (employeeId) => {
  const date = getTodayDateOnly();
  const record = await Attendance.findOne({ where: { employee_id: employeeId, date } });
  if (!record || !record.check_in) throw CustomErrorHandler.validationError('You must check in before checking out');
  if (record.check_out) throw CustomErrorHandler.validationError('Already checked out today');

  record.check_out = new Date();
  const hoursWorked = (record.check_out - new Date(record.check_in)) / (1000 * 60 * 60);
  if (hoursWorked > 8) record.overtime_minutes = Math.round((hoursWorked - 8) * 60);
  await record.save();
  return record;
};

const manualEntry = async (payload) => {
  const { employee_id, date, status, check_in, check_out, remarks } = payload;
  const [record, created] = await Attendance.findOrCreate({
    where: { employee_id, date },
    defaults: { status, check_in, check_out, remarks, is_manual_entry: true },
  });
  if (!created) {
    await record.update({ status, check_in, check_out, remarks, is_manual_entry: true });
  }
  return record;
};

const getAll = async ({ employee_id, department_id, start_date, end_date, status, page = 1, limit = 31 }) => {
  const pageNumber = parseInt(page, 10) || 1;
  const pageSize = parseInt(limit, 10) || 31;

  const where = {};
  if (employee_id) where.employee_id = employee_id;
  if (status) where.status = status;
  if (start_date && end_date) where.date = { [Op.between]: [start_date, end_date] };

  const employeeWhere = department_id ? { department_id } : undefined;

  const result = await Attendance.findAndCountAll({
    where,
    include: [{ model: Employee, where: employeeWhere, include: [Department] }],
    limit: pageSize,
    offset: (pageNumber - 1) * pageSize,
    order: [['date', 'DESC']],
  });

  return {
    items: result.rows,
    total: result.count,
    page: pageNumber,
    totalPages: Math.ceil(result.count / pageSize),
  };
};

const monthlyReport = async ({ employee_id, month, year }) => {
  if (!month || !year) throw CustomErrorHandler.validationError('month and year are required');

  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const end = `${year}-${String(month).padStart(2, '0')}-31`;
  const where = { date: { [Op.between]: [start, end] } };
  if (employee_id) where.employee_id = employee_id;

  const records = await Attendance.findAll({ where, include: [Employee], order: [['date', 'ASC']] });
  const summary = records.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  return { records, summary };
};

module.exports = { checkIn, checkOut, manualEntry, getAll, monthlyReport };
