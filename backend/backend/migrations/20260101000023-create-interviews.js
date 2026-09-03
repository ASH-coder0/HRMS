'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('interviews', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      recruitment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      scheduled_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      interviewer_employee_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      round: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      mode: {
        type: Sequelize.ENUM('in_person', 'video', 'phone'),
        allowNull: true,
        defaultValue: 'in_person',
      },
      result: {
        type: Sequelize.ENUM('pending', 'passed', 'failed'),
        allowNull: true,
        defaultValue: 'pending',
      },
      feedback: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable('interviews');
  },
};
