'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('leave_balances', {
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
      leave_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      allocated_days: {
        type: Sequelize.DECIMAL(4, 1),
        allowNull: true,
        defaultValue: 0,
      },
      used_days: {
        type: Sequelize.DECIMAL(4, 1),
        allowNull: true,
        defaultValue: 0,
      },
      carried_forward_days: {
        type: Sequelize.DECIMAL(4, 1),
        allowNull: true,
        defaultValue: 0,
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
    await queryInterface.dropTable('leave_balances');
  },
};
