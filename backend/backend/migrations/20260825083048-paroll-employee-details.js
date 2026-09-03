'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payroll_employee_details', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      payroll_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'payroll', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'employees', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },

      // Period
      economic_year_id: { type: Sequelize.INTEGER, allowNull: false },
      month: { type: Sequelize.INTEGER, allowNull: false },
      period_label: { type: Sequelize.STRING(50) },
      period_start_ad: { type: Sequelize.DATEONLY },
      period_end_ad: { type: Sequelize.DATEONLY },

      // Salary structure snapshot
      basic_salary: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      housing_allowance: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      transport_allowance: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      medical_allowance: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      other_allowance: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      food_allowance: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      accommodation_allowance: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      gross_monthly_salary: { type: Sequelize.DECIMAL(12, 2), allowNull: false },

      daily_working_hours: { type: Sequelize.DECIMAL(5, 2), defaultValue: 8 },
      ot_enabled: { type: Sequelize.BOOLEAN, defaultValue: false },
      ot_rate_multiplier: { type: Sequelize.DECIMAL(4, 2), defaultValue: 1.5 },

      // Rate calculation snapshot
      working_days: { type: Sequelize.INTEGER, defaultValue: 0 },
      required_monthly_hours: { type: Sequelize.DECIMAL(8, 2), defaultValue: 0 },
      hourly_rate: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      per_day_rate: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },

      // Attendance snapshot
      total_worked_hours: { type: Sequelize.DECIMAL(8, 2), defaultValue: 0 },
      shortfall_hours: { type: Sequelize.DECIMAL(8, 2), defaultValue: 0 },
      unpaid_days: { type: Sequelize.DECIMAL(6, 2), defaultValue: 0 },
      overtime_hours: { type: Sequelize.DECIMAL(8, 2), defaultValue: 0 },
      attendance_summary: { type: Sequelize.JSON },

      // Deductions & additions
      absence_deduction: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      ot_pay: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      other_deductions: { type: Sequelize.JSON },
      other_additions: { type: Sequelize.JSON },

      // Totals
      gross_pay: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      total_deductions: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      total_additions: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      net_pay: { type: Sequelize.DECIMAL(12, 2), allowNull: false },

      // Payment metadata
      receipt_number: { type: Sequelize.STRING(30), allowNull: false, unique: true },
      payment_date: { type: Sequelize.DATE, allowNull: false },
      payment_method: {
        type: Sequelize.ENUM('cash', 'bank_transfer', 'cheque', 'digital_wallet'),
        allowNull: false,
      },
      payment_reference: { type: Sequelize.STRING(100) },
      paid_by_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      remarks: { type: Sequelize.STRING(255) },

      // Void
      status: {
        type: Sequelize.ENUM('paid', 'void'),
        defaultValue: 'paid',
      },
      voided_at: { type: Sequelize.DATE },
      voided_by_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      void_reason: { type: Sequelize.STRING(255) },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('payroll_employee_details', {
      unique: true,
      fields: ['employee_id', 'economic_year_id', 'month'],
      name: 'payroll_employee_details_employee_period_unique',
    });

    await queryInterface.addIndex('payroll_employee_details', {
      fields: ['status'],
      name: 'payroll_employee_details_status_idx',
    });

    await queryInterface.addIndex('payroll_employee_details', {
      fields: ['payment_date'],
      name: 'payroll_employee_details_payment_date_idx',
    });

    await queryInterface.addIndex('payroll_employee_details', {
      fields: ['economic_year_id', 'month'],
      name: 'payroll_employee_details_year_month_idx',
    });

    await queryInterface.addIndex('payroll_employee_details', {
      fields: ['period_start_ad', 'period_end_ad'],
      name: 'payroll_employee_details_period_range_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payroll_employee_details');
  },
};