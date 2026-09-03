const { Op, fn, col, literal } = require('sequelize');
const Employee = require('../../models/Employee');
const Department = require('../../models/Department');
const Attendance = require('../../models/Attendance');
const LeaveRequest = require('../../models/LeaveRequest');
const Payroll = require('../../models/Payroll');
const Recruitment = require('../../models/Recruitment');
const Training = require('../../models/Training');
const { getTodayDateOnly } = require('../helpers/date');

const getCards = async () => {
  const today = getTodayDateOnly();

  const [
    totalEmployees, activeEmployees, presentToday, absentToday, onLeaveToday,
    pendingLeaveRequests, pendingPayroll, openRecruitment, upcomingTrainingSessions,
  ] = await Promise.all([
    Employee.count(),
    Employee.count({ where: { status: 'active' } }),
    Attendance.count({ where: { date: today, status: { [Op.in]: ['present', 'late'] } } }),
    Attendance.count({ where: { date: today, status: 'absent' } }),
    Attendance.count({ where: { date: today, status: 'on_leave' } }),
    LeaveRequest.count({ where: { status: { [Op.in]: ['pending', 'dept_approved'] } } }),
    Payroll.count({ where: { status: 'draft' } }),
    Recruitment.count({ where: { status: 'open' } }),
    Training.count({ where: { start_date: { [Op.gte]: today } } }),
  ]);

  const employees = await Employee.findAll({ attributes: ['id', 'first_name', 'last_name', 'date_of_birth'] });
  const upcomingBirthdays = employees.filter((e) => {
    if (!e.date_of_birth) return false;
    const dob = new Date(e.date_of_birth);
    const now = new Date();
    const next = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
    if (next < now) next.setFullYear(now.getFullYear() + 1);
    return (next - now) / (1000 * 60 * 60 * 24) <= 7;
  }).length;

  return {
    totalEmployees, activeEmployees, presentToday, absentToday, onLeaveToday,
    upcomingBirthdays, pendingLeaveRequests, pendingPayroll, openRecruitment, upcomingTrainingSessions,
  };
};

const getAttendanceTrend = async (days = 14) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return Attendance.findAll({
    attributes: ['date', 'status', [fn('COUNT', col('id')), 'count']],
    where: { date: { [Op.gte]: since.toISOString().slice(0, 10) } },
    group: ['date', 'status'],
    order: [['date', 'ASC']],
  });
};

const getDepartmentDistribution = async () => {
  return Employee.findAll({
    attributes: [[col('Department.name'), 'department'], [fn('COUNT', col('Employee.id')), 'count']],
    include: [{ model: Department, attributes: [] }],
    group: ['Department.id', 'Department.name'],
  });
};

const getPayrollExpense = async () => {
  return Payroll.findAll({
    attributes: ['month', 'year', [fn('SUM', col('net_salary')), 'total']],
    group: ['month', 'year'],
    order: [['year', 'ASC'], ['month', 'ASC']],
  });
};

const getGenderDistribution = async () => {
  return Employee.findAll({
    attributes: ['gender', [fn('COUNT', col('id')), 'count']],
    group: ['gender'],
  });
};

const getMonthlyRecruitment = async () => {
  return Recruitment.findAll({
    attributes: [
      [fn('MONTH', col('createdAt')), 'month'],
      [fn('YEAR', col('createdAt')), 'year'],
      [fn('COUNT', col('id')), 'count'],
    ],
    group: [literal('month'), literal('year')],
    order: [[literal('year'), 'ASC'], [literal('month'), 'ASC']],
  });
};

const getLeaveStatistics = async () => {
  return LeaveRequest.findAll({
    attributes: ['status', [fn('COUNT', col('id')), 'count']],
    group: ['status'],
  });
};

const getRecentActivity = async () => {
  const [newHires, recentLeaves, recentAttendance] = await Promise.all([
    Employee.findAll({ order: [['createdAt', 'DESC']], limit: 5, attributes: ['id', 'first_name', 'last_name', 'createdAt'] }),
    LeaveRequest.findAll({ where: { status: 'approved' }, order: [['hr_approved_at', 'DESC']], limit: 5, include: [Employee] }),
    Attendance.findAll({ order: [['updatedAt', 'DESC']], limit: 5, include: [Employee] }),
  ]);
  return { newHires, recentLeaves, recentAttendance };
};

module.exports = {
  getCards, getAttendanceTrend, getDepartmentDistribution, getPayrollExpense,
  getGenderDistribution, getMonthlyRecruitment, getLeaveStatistics, getRecentActivity,
};
