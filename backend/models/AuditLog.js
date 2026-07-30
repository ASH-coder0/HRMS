const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: true },
  action: { type: DataTypes.STRING(100), allowNull: false },
  entity_type: { type: DataTypes.STRING(50) },
  entity_id: { type: DataTypes.INTEGER },
  ip_address: { type: DataTypes.STRING(45) },
  metadata: { type: DataTypes.JSON },
}, {
  tableName: 'audit_logs',
  timestamps: true,
});

AuditLog.belongsTo(User, { foreignKey: 'user_id' });

module.exports = AuditLog;
