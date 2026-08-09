'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('assets', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      asset_tag: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      category: {
        type: Sequelize.ENUM('equipment', 'laptop', 'id_card', 'mobile_phone', 'uniform', 'other'),
        allowNull: false,
      },
      purchase_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      purchase_cost: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('available', 'assigned', 'maintenance', 'retired'),
        allowNull: true,
        defaultValue: 'available',
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
    await queryInterface.dropTable('assets');
  },
};
