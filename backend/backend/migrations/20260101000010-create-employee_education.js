'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('employee_education', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      degree: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      institution: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      year_completed: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      grade: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('employee_education');
  },
};
