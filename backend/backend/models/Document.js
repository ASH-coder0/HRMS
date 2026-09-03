const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');

const Document = sequelize.define('Document', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  employee_id: { type: DataTypes.INTEGER, allowNull: false },
  doc_type: { type: DataTypes.STRING(50), allowNull: false },
  title: { type: DataTypes.STRING(150), allowNull: false },
  file_url: { type: DataTypes.STRING(255), allowNull: false },
  issued_by: { type: DataTypes.STRING(150) },
  issue_date: { type: DataTypes.DATEONLY },
  expiry_date: { type: DataTypes.DATEONLY },
}, {
  tableName: 'documents',
  timestamps: true,
});

Document.belongsTo(Employee, { foreignKey: 'employee_id' });

module.exports = Document;
