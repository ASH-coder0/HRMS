const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Asset = require('./Asset');
const Employee = require('./Employee');

const AssetAssignment = sequelize.define('AssetAssignment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  asset_id: { type: DataTypes.INTEGER, allowNull: false },
  employee_id: { type: DataTypes.INTEGER, allowNull: false },
  assigned_at: { type: DataTypes.DATE, allowNull: false },
  returned_at: { type: DataTypes.DATE },
  condition_on_assign: { type: DataTypes.STRING(100) },
  condition_on_return: { type: DataTypes.STRING(100) },
  remarks: { type: DataTypes.STRING(255) },
}, {
  tableName: 'asset_assignments',
  timestamps: true,
});

AssetAssignment.belongsTo(Asset, { foreignKey: 'asset_id' });
AssetAssignment.belongsTo(Employee, { foreignKey: 'employee_id' });

module.exports = AssetAssignment;
