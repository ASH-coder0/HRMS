'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Add user_id temporarily as nullable
    await queryInterface.addColumn(
      'economic_years',
      'user_id',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
      }
    );

    // Step 2: Assign existing economic years to users
    //
    // CHANGE THESE USER IDs according to your users table.
    //
    await queryInterface.sequelize.query(`
      UPDATE economic_years
      SET user_id = 1
      WHERE id = 1
    `);

    await queryInterface.sequelize.query(`
      UPDATE economic_years
      SET user_id = 2
      WHERE id = 2
    `);

    // Step 3: Make user_id required
    await queryInterface.changeColumn(
      'economic_years',
      'user_id',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
      }
    );

    // Step 4: One economic year per user
    await queryInterface.addIndex(
      'economic_years',
      ['user_id'],
      {
        unique: true,
        name: 'unique_user_economic_year',
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      'economic_years',
      'unique_user_economic_year'
    );

    await queryInterface.removeColumn(
      'economic_years',
      'user_id'
    );
  },
};