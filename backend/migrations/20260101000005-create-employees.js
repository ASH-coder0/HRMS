'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('employees', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      employee_code: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
      },
      first_name: {
        type: Sequelize.STRING(80),
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING(80),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'other'),
        allowNull: true,
      },
      date_of_birth: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      date_of_joining: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      designation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      employment_type: {
        type: Sequelize.ENUM('full_time', 'part_time', 'contract', 'intern'),
        allowNull: true,
        defaultValue: 'full_time',
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'on_leave', 'terminated'),
        allowNull: true,
        defaultValue: 'active',
      },
      address: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      blood_group: {
        type: Sequelize.STRING(5),
        allowNull: true,
      },
      profile_photo_url: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      medical_license_no: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      medical_license_expiry: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('employees');
  },
};
