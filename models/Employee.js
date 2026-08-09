const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Department = require('./Department');
const Designation = require('./Designation');
const Role = require('./Role');

const Employee = sequelize.define('Employee', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  employee_code: { type: DataTypes.STRING(30), allowNull: false, unique: true },
  first_name: { type: DataTypes.STRING(80), allowNull: false },
  last_name: { type: DataTypes.STRING(80), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  phone: { type: DataTypes.STRING(20) },
  gender: { type: DataTypes.ENUM('male', 'female', 'other') },
  date_of_birth: { type: DataTypes.DATEONLY },
  date_of_joining: { type: DataTypes.DATEONLY, allowNull: false },
  department_id: { type: DataTypes.INTEGER, allowNull: false },
  designation_id: { type: DataTypes.INTEGER, allowNull: false },
  role_id: { type: DataTypes.INTEGER, allowNull: false },
  employment_type: { type: DataTypes.ENUM('full_time', 'part_time', 'contract', 'intern'), defaultValue: 'full_time' },
  status: { type: DataTypes.ENUM('active', 'inactive', 'on_leave', 'terminated'), defaultValue: 'active' },
  address: { type: DataTypes.STRING(255) },
  blood_group: { type: DataTypes.STRING(5) },
  profile_photo_url: { type: DataTypes.STRING(255) },
  medical_license_no: { type: DataTypes.STRING(100) },
  medical_license_expiry: { type: DataTypes.DATEONLY },
}, {
  tableName: 'employees',
  timestamps: true,
});

Employee.belongsTo(Department, { foreignKey: 'department_id' });
Employee.belongsTo(Designation, { foreignKey: 'designation_id' });
Employee.belongsTo(Role, { foreignKey: 'role_id' });

module.exports = Employee;
