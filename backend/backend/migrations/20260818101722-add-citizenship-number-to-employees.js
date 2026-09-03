'use strict';

module.exports = {
  async up(queryInterface) {
    const table = await queryInterface.describeTable('employees');

    if (!table.citizenship_number) {
      const Sequelize = queryInterface.sequelize.Sequelize;

      await queryInterface.addColumn('employees', 'citizenship_number', {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('employees');

    if (table.citizenship_number) {
      await queryInterface.removeColumn(
        'employees',
        'citizenship_number'
      );
    }
  },
};