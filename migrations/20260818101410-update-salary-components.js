"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "salary_components",
      "basic_salary_multiplier",
      {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 1,
      }
    );

    await queryInterface.addColumn(
      "salary_components",
      "food_enabled",
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }
    );

    await queryInterface.addColumn(
      "salary_components",
      "food_allowance",
      {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      }
    );

    await queryInterface.addColumn(
      "salary_components",
      "accommodation_enabled",
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }
    );

    await queryInterface.addColumn(
      "salary_components",
      "accommodation_allowance",
      {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      }
    );

    await queryInterface.addColumn(
      "salary_components",
      "daily_working_hours",
      {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 8,
      }
    );

    await queryInterface.addColumn(
      "salary_components",
      "ot_enabled",
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }
    );

    await queryInterface.addColumn(
      "salary_components",
      "ot_rate",
      {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      }
    );

    await queryInterface.addColumn(
      "salary_components",
      "end_date",
      {
        type: Sequelize.DATEONLY,
        allowNull: true,
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      "salary_components",
      "basic_salary_multiplier"
    );

    await queryInterface.removeColumn(
      "salary_components",
      "food_enabled"
    );

    await queryInterface.removeColumn(
      "salary_components",
      "food_allowance"
    );

    await queryInterface.removeColumn(
      "salary_components",
      "accommodation_enabled"
    );

    await queryInterface.removeColumn(
      "salary_components",
      "accommodation_allowance"
    );

    await queryInterface.removeColumn(
      "salary_components",
      "daily_working_hours"
    );

    await queryInterface.removeColumn(
      "salary_components",
      "ot_enabled"
    );

    await queryInterface.removeColumn(
      "salary_components",
      "ot_rate"
    );

    await queryInterface.removeColumn(
      "salary_components",
      "end_date"
    );
  },
};