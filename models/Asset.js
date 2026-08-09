const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Asset = sequelize.define('Asset', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  asset_tag: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  category: { type: DataTypes.ENUM('equipment', 'laptop', 'id_card', 'mobile_phone', 'uniform', 'other'), allowNull: false },
  purchase_date: { type: DataTypes.DATEONLY },
  purchase_cost: { type: DataTypes.DECIMAL(12, 2) },
  status: { type: DataTypes.ENUM('available', 'assigned', 'maintenance', 'retired'), defaultValue: 'available' },
}, {
  tableName: 'assets',
  timestamps: true,
});

module.exports = Asset;
