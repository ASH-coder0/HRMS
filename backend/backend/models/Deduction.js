const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Payroll = require('./Payroll');

const Deduction = sequelize.define('Deduction', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  payroll_id: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.STRING(50), allowNull: false },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  remarks: { type: DataTypes.STRING(255) },
}, {
  tableName: 'deductions',
  timestamps: true,
});

Deduction.belongsTo(Payroll, { foreignKey: 'payroll_id' });

module.exports = Deduction;
