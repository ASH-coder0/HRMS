const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');
const Shift = require('./Shift');

const EmployeeShift = sequelize.define('EmployeeShift', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  employee_id: { type: DataTypes.INTEGER, allowNull: false },
  shift_id: { type: DataTypes.INTEGER, allowNull: false },
  effective_date: { type: DataTypes.DATEONLY, allowNull: false },
  day_of_week: { type: DataTypes.INTEGER },
}, {
  tableName: 'employee_shifts',
  timestamps: true,
});

EmployeeShift.belongsTo(Employee, { foreignKey: 'employee_id' });
EmployeeShift.belongsTo(Shift, { foreignKey: 'shift_id' });

module.exports = EmployeeShift;
