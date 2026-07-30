const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Recruitment = require('./Recruitment');

const Interview = sequelize.define('Interview', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  recruitment_id: { type: DataTypes.INTEGER, allowNull: false },
  scheduled_at: { type: DataTypes.DATE, allowNull: false },
  interviewer_employee_id: { type: DataTypes.INTEGER },
  round: { type: DataTypes.STRING(50) },
  mode: { type: DataTypes.ENUM('in_person', 'video', 'phone'), defaultValue: 'in_person' },
  result: { type: DataTypes.ENUM('pending', 'passed', 'failed'), defaultValue: 'pending' },
  feedback: { type: DataTypes.TEXT },
}, {
  tableName: 'interviews',
  timestamps: true,
});

Interview.belongsTo(Recruitment, { foreignKey: 'recruitment_id' });

module.exports = Interview;
