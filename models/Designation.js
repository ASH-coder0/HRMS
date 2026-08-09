const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Department = require('./Department');

const Designation = sequelize.define('Designation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(100), allowNull: false },
  department_id: { type: DataTypes.INTEGER, allowNull: false },
  level: { type: DataTypes.STRING(50) },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'designations',
  timestamps: true,
});

Designation.belongsTo(Department, { foreignKey: 'department_id' });

module.exports = Designation;
