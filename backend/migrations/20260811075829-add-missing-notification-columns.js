'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // No-op: these columns are already included directly in
    // 20260101000029-create-notifications.js on fresh installs.
    // This migration only applied to older databases created before
    // that migration included them.
  },

  async down(queryInterface) {
    // No-op for the same reason.
  },
};