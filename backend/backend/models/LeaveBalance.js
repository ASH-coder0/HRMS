const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');
const LeaveType = require('./LeaveType');

const LeaveBalance = sequelize.define('LeaveBalance', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  employee_id: { type: DataTypes.INTEGER, allowNull: false },
  leave_type_id: { type: DataTypes.INTEGER, allowNull: false },
  year: { type: DataTypes.INTEGER, allowNull: false },
  allocated_days: { type: DataTypes.DECIMAL(4, 1), defaultValue: 0 },
  used_days: { type: DataTypes.DECIMAL(4, 1), defaultValue: 0 },
  carried_forward_days: { type: DataTypes.DECIMAL(4, 1), defaultValue: 0 },
}, {
  tableName: 'leave_balances',
  timestamps: true,
  indexes: [{ unique: true, fields: ['employee_id', 'leave_type_id', 'year'] }],
});

LeaveBalance.belongsTo(Employee, { foreignKey: 'employee_id' });
LeaveBalance.belongsTo(LeaveType, { foreignKey: 'leave_type_id' });

module.exports = LeaveBalance;
