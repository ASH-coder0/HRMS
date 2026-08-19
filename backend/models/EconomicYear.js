const { DataTypes } = require('sequelize');

const sequelize = require('../config/database');

const CalendarSetup = sequelize.define(
  'CalendarSetup',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nepali_year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Nepali Bikram Sambat year, e.g. 2083',
    },

    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Nepali month number: 1 to 12',
      validate: {
        min: 1,
        max: 12,
      },
    },

    month_name: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Nepali month name',
    },

    working_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Number of working days in the month',
      validate: {
        min: 0,
        max: 32,
      },
    },
  },
  {
    tableName: 'calendar_setups',
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: ['nepali_year', 'month'],
        name: 'unique_nepali_year_month',
      },
    ],
  }
);

module.exports = CalendarSetup;