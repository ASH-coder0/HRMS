const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LeaveType = sequelize.define('LeaveType', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  default_days_per_year: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_paid: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'leave_types',
  timestamps: true,
});

module.exports = LeaveType;
