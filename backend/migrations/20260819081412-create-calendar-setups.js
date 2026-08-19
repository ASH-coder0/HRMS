'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('calendar_setups', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      nepali_year: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Nepali Bikram Sambat year',
      },

      month: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Nepali month number from 1 to 12',
      },

      month_name: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'Nepali month name',
      },

      working_days: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Number of working days in the month',
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ),
      },
    });

    await queryInterface.addIndex(
      'calendar_setups',
      ['nepali_year', 'month'],
      {
        unique: true,
        name: 'unique_nepali_year_month',
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('calendar_setups');
  },
};