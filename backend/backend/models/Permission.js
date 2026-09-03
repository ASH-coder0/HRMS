const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Permission = sequelize.define('Permission', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  module: { type: DataTypes.STRING(50), allowNull: false },
  action: { type: DataTypes.STRING(50), allowNull: false },
  key: { type: DataTypes.STRING(100), allowNull: false, unique: true },
}, {
  tableName: 'permissions',
  timestamps: true,
});

module.exports = Permission;
