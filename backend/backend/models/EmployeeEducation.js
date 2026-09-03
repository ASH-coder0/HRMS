const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');

const EmployeeEducation = sequelize.define('EmployeeEducation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  employee_id: { type: DataTypes.INTEGER, allowNull: false },
  degree: { type: DataTypes.STRING(150), allowNull: false },
  institution: { type: DataTypes.STRING(150), allowNull: false },
  year_completed: { type: DataTypes.INTEGER },
  grade: { type: DataTypes.STRING(20) },
}, {
  tableName: 'employee_education',
  timestamps: true,
});

EmployeeEducation.belongsTo(Employee, { foreignKey: 'employee_id' });

module.exports = EmployeeEducation;
