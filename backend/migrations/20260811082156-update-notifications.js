'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('notifications', 'user_id', {
      type: Sequelize.INTEGER(255),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('notifications', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};