'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('attendance', {
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
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      check_in: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      check_out: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('present', 'absent', 'half_day', 'late', 'on_leave', 'holiday'),
        allowNull: true,
        defaultValue: 'present',
      },
      is_manual_entry: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      overtime_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      late_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      remarks: {
        type: Sequelize.STRING(255),
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
    await queryInterface.dropTable('attendance');
  },
};
