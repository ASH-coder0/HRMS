const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');

const Attendance = sequelize.define('Attendance', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  employee_id: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  check_in: { type: DataTypes.DATE },
  check_out: { type: DataTypes.DATE },
  status: { type: DataTypes.ENUM('present', 'absent', 'half_day', 'late', 'on_leave', 'holiday'), defaultValue: 'present' },
  is_manual_entry: { type: DataTypes.BOOLEAN, defaultValue: false },
  overtime_minutes: { type: DataTypes.INTEGER, defaultValue: 0 },
  late_minutes: { type: DataTypes.INTEGER, defaultValue: 0 },
  remarks: { type: DataTypes.STRING(255) },
}, {
  tableName: 'attendance',
  timestamps: true,
  indexes: [{ unique: true, fields: ['employee_id', 'date'] }],
});

Attendance.belongsTo(Employee, { foreignKey: 'employee_id' });

module.exports = Attendance;
