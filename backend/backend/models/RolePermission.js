const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Role = require('./Role');
const Permission = require('./Permission');

const RolePermission = sequelize.define('RolePermission', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  role_id: { type: DataTypes.INTEGER, allowNull: false },
  permission_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'role_permissions',
  timestamps: true,
});

RolePermission.belongsTo(Role, { foreignKey: 'role_id' });
RolePermission.belongsTo(Permission, { foreignKey: 'permission_id' });

module.exports = RolePermission;
