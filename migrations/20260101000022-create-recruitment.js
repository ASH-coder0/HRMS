'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('recruitment', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      job_title: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      designation_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      openings: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
      },
      status: {
        type: Sequelize.ENUM('open', 'closed', 'on_hold'),
        allowNull: true,
        defaultValue: 'open',
      },
      candidate_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      candidate_email: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      candidate_phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      resume_url: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      candidate_status: {
        type: Sequelize.ENUM('applied', 'shortlisted', 'interviewing', 'offered', 'hired', 'rejected'),
        allowNull: true,
        defaultValue: 'applied',
      },
      offer_letter_url: {
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
    await queryInterface.dropTable('recruitment');
  },
};
