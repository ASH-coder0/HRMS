'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('performance_reviews', {
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
      reviewer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      review_period: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      kpi_score: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: true,
      },
      rating: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true,
      },
      comments: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      promotion_recommended: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      status: {
        type: Sequelize.ENUM('draft', 'submitted', 'acknowledged'),
        allowNull: true,
        defaultValue: 'draft',
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
    await queryInterface.dropTable('performance_reviews');
  },
};
