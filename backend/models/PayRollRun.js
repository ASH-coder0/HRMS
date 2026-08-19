const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');
const Salary = require('./Salary');

const PayrollRun = sequelize.define(
  'PayrollRun',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    period_start: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    period_end: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM('draft', 'approved', 'paid'),
      allowNull: false,
      defaultValue: 'draft',
    },

    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    approved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'payroll_runs',
    timestamps: true,
  }
);

// Relationships

PayrollRun.hasMany(Salary, {
  foreignKey: 'payroll_run_id',
  as: 'details',
});

PayrollRun.belongsTo(Employee, {
  foreignKey: 'created_by',
  as: 'creator',
});

PayrollRun.belongsTo(Employee, {
  foreignKey: 'approved_by',
  as: 'approver',
});

module.exports = PayrollRun;