const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');

const EmergencyContact = sequelize.define('EmergencyContact', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  employee_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(100), allowNull: false },
  relationship: { type: DataTypes.STRING(50) },
  phone: { type: DataTypes.STRING(20), allowNull: false },
  address: { type: DataTypes.STRING(255) },
}, {
  tableName: 'emergency_contacts',
  timestamps: true,
});

EmergencyContact.belongsTo(Employee, { foreignKey: 'employee_id' });

module.exports = EmergencyContact;
