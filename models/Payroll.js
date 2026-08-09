const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');

const Payroll = sequelize.define('Payroll', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  employee_id: { type: DataTypes.INTEGER, allowNull: false },
  month: { type: DataTypes.INTEGER, allowNull: false },
  year: { type: DataTypes.INTEGER, allowNull: false },
  gross_salary: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  total_deductions: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  total_bonuses: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  overtime_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  net_salary: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  status: { type: DataTypes.ENUM('draft', 'generated', 'paid'), defaultValue: 'draft' },
  payslip_url: { type: DataTypes.STRING(255) },
  generated_at: { type: DataTypes.DATE },
}, {
  tableName: 'payroll',
  timestamps: true,
  indexes: [{ unique: true, fields: ['employee_id', 'month', 'year'] }],
});

Payroll.belongsTo(Employee, { foreignKey: 'employee_id' });

module.exports = Payroll;
