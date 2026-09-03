const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');
const Training = require('./Training');

const EmployeeTraining = sequelize.define('EmployeeTraining', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  employee_id: { type: DataTypes.INTEGER, allowNull: false },
  training_id: { type: DataTypes.INTEGER, allowNull: false },
  registered_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  completion_status: { type: DataTypes.ENUM('registered', 'in_progress', 'completed', 'dropped'), defaultValue: 'registered' },
  certificate_url: { type: DataTypes.STRING(255) },
}, {
  tableName: 'employee_trainings',
  timestamps: true,
  indexes: [{ unique: true, fields: ['employee_id', 'training_id'] }],
});

EmployeeTraining.belongsTo(Employee, { foreignKey: 'employee_id' });
EmployeeTraining.belongsTo(Training, { foreignKey: 'training_id' });

module.exports = EmployeeTraining;
