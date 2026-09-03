const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Department = sequelize.define('Department', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  code: { type: DataTypes.STRING(20), unique: true },
  head_employee_id: { type: DataTypes.INTEGER, allowNull: true },
  description: { type: DataTypes.TEXT },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'departments',
  timestamps: true,
});

module.exports = Department;
