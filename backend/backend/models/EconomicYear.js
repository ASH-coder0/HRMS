// models/EconomicYear.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EconomicYear = sequelize.define(
  'EconomicYear',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },

    economic_year: {
      type: DataTypes.STRING(50),
      allowNull: false,
      //unique: true,
      comment: 'Economic year, e.g. 2083/2084',
    },

    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'economic_years',
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: ['user_id'],
        name: 'unique_user_economic_year',
      },
      {
        //unique: true,
        fields: ['economic_year'],
        name: 'unique_economic_year',
      },
    ],
  }
);

module.exports = EconomicYear;