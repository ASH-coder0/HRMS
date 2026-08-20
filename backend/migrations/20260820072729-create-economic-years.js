'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('economic_years', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      economic_year: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Economic year, e.g. 2083/2084',
      },

      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex(
      'economic_years',
      ['economic_year'],
      {
        unique: true,
        name: 'unique_economic_year',
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('economic_years');
  },
};