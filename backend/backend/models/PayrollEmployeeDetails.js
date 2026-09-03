const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Payroll = require('./Payroll');
const Employee = require('./Employee');
const User = require('./User');

const PayrollEmployeeDetails = sequelize.define('PayrollEmployeeDetails', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  payroll_id: { type: DataTypes.INTEGER, allowNull: false },
  employee_id: { type: DataTypes.INTEGER, allowNull: false },

  // Period
  economic_year_id: { type: DataTypes.INTEGER, allowNull: false },
  month: { type: DataTypes.INTEGER, allowNull: false },
  period_label: { type: DataTypes.STRING(50) },
  period_start_ad: { type: DataTypes.DATEONLY },
  period_end_ad: { type: DataTypes.DATEONLY },

  // Salary structure snapshot (frozen at payment time)
  basic_salary: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  housing_allowance: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  transport_allowance: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  medical_allowance: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  other_allowance: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  food_allowance: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  accommodation_allowance: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  gross_monthly_salary: { type: DataTypes.DECIMAL(12, 2), allowNull: false },

  daily_working_hours: { type: DataTypes.DECIMAL(5, 2), defaultValue: 8 },
  ot_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
  ot_rate_multiplier: { type: DataTypes.DECIMAL(4, 2), defaultValue: 1.5 },

  // Rate calculation snapshot
  working_days: { type: DataTypes.INTEGER, defaultValue: 0 },
  required_monthly_hours: { type: DataTypes.DECIMAL(8, 2), defaultValue: 0 },
  hourly_rate: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  per_day_rate: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },

  // Attendance snapshot
  total_worked_hours: { type: DataTypes.DECIMAL(8, 2), defaultValue: 0 },
  shortfall_hours: { type: DataTypes.DECIMAL(8, 2), defaultValue: 0 },
  unpaid_days: { type: DataTypes.DECIMAL(6, 2), defaultValue: 0 },
  overtime_hours: { type: DataTypes.DECIMAL(8, 2), defaultValue: 0 },
  attendance_summary: { type: DataTypes.JSON }, // { present: 26, absent: 1, leave: 1 }

  // Deductions & additions
  absence_deduction: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  ot_pay: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  other_deductions: { type: DataTypes.JSON }, // [{ label, amount }]
  other_additions: { type: DataTypes.JSON },  // [{ label, amount }]

  // Totals
  gross_pay: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  total_deductions: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  total_additions: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  net_pay: { type: DataTypes.DECIMAL(12, 2), allowNull: false },

  // Payment metadata
  receipt_number: { type: DataTypes.STRING(30), allowNull: false, unique: true },
  payment_date: { type: DataTypes.DATE, allowNull: false },
  payment_method: {
    type: DataTypes.ENUM('cash', 'bank_transfer', 'cheque', 'digital_wallet'),
    allowNull: false,
  },
  payment_reference: { type: DataTypes.STRING(100) },
  paid_by_id: { type: DataTypes.INTEGER, allowNull: false },
  remarks: { type: DataTypes.STRING(255) },

  // void
  status: { type: DataTypes.ENUM('paid', 'void'), defaultValue: 'paid' },
  voided_at: { type: DataTypes.DATE },
  voided_by_id: { type: DataTypes.INTEGER },
  void_reason: { type: DataTypes.STRING(255) },
}, {
  tableName: 'payroll_employee_details',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['employee_id', 'economic_year_id', 'month'] },
    { fields: ['status'] },
    { fields: ['payment_date'] },
    { fields: ['economic_year_id', 'month'] },
    { fields: ['period_start_ad', 'period_end_ad'] },
  ],
});

PayrollEmployeeDetails.belongsTo(Payroll, { foreignKey: 'payroll_id' });
PayrollEmployeeDetails.belongsTo(Employee, { foreignKey: 'employee_id' });
PayrollEmployeeDetails.belongsTo(User, { foreignKey: 'paid_by_id', as: 'paidBy' });
PayrollEmployeeDetails.belongsTo(User, { foreignKey: 'voided_by_id', as: 'voidedBy' });

module.exports = PayrollEmployeeDetails;