"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("roles", [
      {
        id: 1,
        name: "super_admin",
        description: "Full system access",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: "hr_manager",
        description: "Manages HR operations",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        name: "hospital_admin",
        description: "Hospital-wide administration",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        name: "department_head",
        description: "Heads a clinical/admin department",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        name: "doctor",
        description: "Medical doctor",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 6,
        name: "nurse",
        description: "Nursing staff",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 7,
        name: "pharmacist",
        description: "Pharmacy staff",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 8,
        name: "lab_technician",
        description: "Laboratory staff",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 9,
        name: "receptionist",
        description: "Front desk staff",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 10,
        name: "accountant",
        description: "Finance & payroll staff",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 11,
        name: "employee",
        description: "Standard employee",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("roles", null, {});
  },
};
