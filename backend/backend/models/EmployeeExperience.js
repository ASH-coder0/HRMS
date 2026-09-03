const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');

const EmployeeExperience = sequelize.define('EmployeeExperience', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  employee_id: { type: DataTypes.INTEGER, allowNull: false },
  organization: { type: DataTypes.STRING(150), allowNull: false },
  designation: { type: DataTypes.STRING(150) },
  start_date: { type: DataTypes.DATEONLY },
  end_date: { type: DataTypes.DATEONLY },
  description: { type: DataTypes.TEXT },
}, {
  tableName: 'employee_experience',
  timestamps: true,
});

EmployeeExperience.belongsTo(Employee, { foreignKey: 'employee_id' });

module.exports = EmployeeExperience;
