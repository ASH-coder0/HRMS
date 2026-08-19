const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Employee = require("./Employee");

const Salary = sequelize.define(
  "Salary",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "employees",
        key: "id",
      },
    },
    basic_salary: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    housing_allowance: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    transport_allowance: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    medical_allowance: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    other_allowance: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    effective_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    tableName: "salary_components",
    timestamps: true,
  },
);

Salary.belongsTo(Employee, { foreignKey: "employee_id" });

module.exports = Salary;
