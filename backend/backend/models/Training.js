const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Training = sequelize.define('Training', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(150), allowNull: false },
  description: { type: DataTypes.TEXT },
  trainer: { type: DataTypes.STRING(150) },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  end_date: { type: DataTypes.DATEONLY },
  location: { type: DataTypes.STRING(150) },
  capacity: { type: DataTypes.INTEGER },
}, {
  tableName: 'trainings',
  timestamps: true,
});

module.exports = Training;
