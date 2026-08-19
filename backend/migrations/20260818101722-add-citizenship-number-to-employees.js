'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('employees', 'citizenship_number', {
      type: Sequelize.STRING(50),
      allowNull: true,
      unique: true,
      after: 'phone',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      'employees',
      'citizenship_number'
    );
  },
};