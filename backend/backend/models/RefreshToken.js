const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const RefreshToken = sequelize.define('RefreshToken', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  token: { type: DataTypes.STRING(500), allowNull: false },
}, {
  tableName: 'refresh_tokens',
  timestamps: true,
});

RefreshToken.belongsTo(User, { foreignKey: 'user_id' });

module.exports = RefreshToken;
