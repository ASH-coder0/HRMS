"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("designations", [
      {
        id: 1,
        title: "HR Manager",
        department_id: 6,
        level: "Manager",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        title: "System Administrator",
        department_id: 7,
        level: "Senior",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        title: "Hospital Administrator",
        department_id: 1,
        level: "Manager",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        title: "Department Head",
        department_id: 2,
        level: "Manager",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        title: "Consultant Doctor",
        department_id: 2,
        level: "Senior",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 6,
        title: "Staff Nurse",
        department_id: 3,
        level: "Junior",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 7,
        title: "Pharmacist",
        department_id: 5,
        level: "Mid",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 8,
        title: "Lab Technician",
        department_id: 6,
        level: "Mid",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 9,
        title: "Receptionist",
        department_id: 7,
        level: "Junior",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 10,
        title: "Accountant",
        department_id: 8,
        level: "Mid",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 11,
        title: "General Employee",
        department_id: 9,
        level: "Junior",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("designations", null, {});
  },
};
