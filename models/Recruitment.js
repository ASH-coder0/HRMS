const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Department = require('./Department');
const Designation = require('./Designation');

const Recruitment = sequelize.define('Recruitment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  job_title: { type: DataTypes.STRING(150), allowNull: false },
  department_id: { type: DataTypes.INTEGER, allowNull: false },
  designation_id: { type: DataTypes.INTEGER },
  description: { type: DataTypes.TEXT },
  openings: { type: DataTypes.INTEGER, defaultValue: 1 },
  status: { type: DataTypes.ENUM('open', 'closed', 'on_hold'), defaultValue: 'open' },
  candidate_name: { type: DataTypes.STRING(100) },
  candidate_email: { type: DataTypes.STRING(150) },
  candidate_phone: { type: DataTypes.STRING(20) },
  resume_url: { type: DataTypes.STRING(255) },
  candidate_status: { type: DataTypes.ENUM('applied', 'shortlisted', 'interviewing', 'offered', 'hired', 'rejected'), defaultValue: 'applied' },
  offer_letter_url: { type: DataTypes.STRING(255) },
}, {
  tableName: 'recruitment',
  timestamps: true,
});

Recruitment.belongsTo(Department, { foreignKey: 'department_id' });
Recruitment.belongsTo(Designation, { foreignKey: 'designation_id' });

module.exports = Recruitment;
