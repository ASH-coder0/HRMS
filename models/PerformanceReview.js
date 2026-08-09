const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');

const PerformanceReview = sequelize.define('PerformanceReview', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  employee_id: { type: DataTypes.INTEGER, allowNull: false },
  reviewer_id: { type: DataTypes.INTEGER, allowNull: false },
  review_period: { type: DataTypes.STRING(20), allowNull: false },
  kpi_score: { type: DataTypes.DECIMAL(4, 2) },
  rating: { type: DataTypes.DECIMAL(3, 2) },
  comments: { type: DataTypes.TEXT },
  promotion_recommended: { type: DataTypes.BOOLEAN, defaultValue: false },
  status: { type: DataTypes.ENUM('draft', 'submitted', 'acknowledged'), defaultValue: 'draft' },
}, {
  tableName: 'performance_reviews',
  timestamps: true,
});

PerformanceReview.belongsTo(Employee, { foreignKey: 'employee_id' });

module.exports = PerformanceReview;
