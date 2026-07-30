'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('shifts', [
      { id: 1, name: 'Morning', start_time: '07:00:00', end_time: '15:00:00', is_night_shift: false, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'Evening', start_time: '15:00:00', end_time: '23:00:00', is_night_shift: false, createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: 'Night', start_time: '23:00:00', end_time: '07:00:00', is_night_shift: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 4, name: 'Rotational', start_time: '09:00:00', end_time: '17:00:00', is_night_shift: false, createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('shifts', null, {});
  },
};
