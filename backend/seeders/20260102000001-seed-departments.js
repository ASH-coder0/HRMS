"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("departments", [
      {
        id: 1,
        name: "Cardiology",
        code: "CARD",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: "Emergency",
        code: "ER",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        name: "Pediatrics",
        code: "PEDS",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        name: "Radiology",
        code: "RAD",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        name: "Pharmacy",
        code: "PHRM",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 6,
        name: "Human Resources",
        code: "HR",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 7,
        name: "Administration",
        code: "ADMIN",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 8,
        name: "Finance",
        code: "FIN",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 9,
        name: "General Services",
        code: "GS",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 10,
        name: "Information Technology",
        code: "IT",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("departments", null, {});
  },
};
