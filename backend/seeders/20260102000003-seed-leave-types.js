'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('leave_types', [
      { id: 1, name: 'Annual', default_days_per_year: 21, is_paid: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'Sick', default_days_per_year: 12, is_paid: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: 'Casual', default_days_per_year: 7, is_paid: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 4, name: 'Maternity', default_days_per_year: 90, is_paid: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 5, name: 'Emergency', default_days_per_year: 5, is_paid: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 6, name: 'Unpaid', default_days_per_year: 0, is_paid: false, createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('leave_types', null, {});
  },
};
