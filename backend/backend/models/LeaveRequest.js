const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');
const LeaveType = require('./LeaveType');

const LeaveRequest = sequelize.define('LeaveRequest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  employee_id: { type: DataTypes.INTEGER, allowNull: false },
  leave_type_id: { type: DataTypes.INTEGER, allowNull: false },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  end_date: { type: DataTypes.DATEONLY, allowNull: false },
  total_days: { type: DataTypes.DECIMAL(4, 1), allowNull: false },
  reason: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('pending', 'dept_approved', 'approved', 'rejected', 'cancelled'), defaultValue: 'pending' },
  department_approver_id: { type: DataTypes.INTEGER },
  department_approved_at: { type: DataTypes.DATE },
  hr_approver_id: { type: DataTypes.INTEGER },
  hr_approved_at: { type: DataTypes.DATE },
  rejection_reason: { type: DataTypes.STRING(255) },
}, {
  tableName: 'leave_requests',
  timestamps: true,
});

LeaveRequest.belongsTo(Employee, { foreignKey: 'employee_id' });
LeaveRequest.belongsTo(LeaveType, { foreignKey: 'leave_type_id' });

module.exports = LeaveRequest;
