import sequelize from "../../config/database.js";
import Payroll from "../../models/Payroll.js";
import PayrollEmployeeDetails from "../../models/PayrollEmployeeDetails.js";
import Employee from "../../models/Employee.js";

const generateReceiptNumber = async (economicYearId, transaction) => {
  const count = await PayrollEmployeeDetails.count({
    where: {
      economic_year_id: economicYearId,
    },
    transaction,
  });

  const sequence = String(count + 1).padStart(4, "0");

  return `PS-${economicYearId}-${sequence}`;
};

export const saveEmployeePayroleDetailsService = async (payload) => {
  const {
    employeeId,
    economicYearId,
    month,
    periodLabel,
    periodStartAD,
    periodEndAD,
    salary,
    payroll,
    paymentMethod,
    paymentReference,
    paidById,
    remarks,
    year,
    otherDeductions = [],
    otherAdditions = [],
  } = payload;

  const transaction = await sequelize.transaction();

  try {
    if (!employeeId) {
      throw { status: 400, message: "Employee ID is required" };
    }

    if (!economicYearId) {
      throw { status: 400, message: "Economic year is required" };
    }

    if (!month) {
      throw { status: 400, message: "Month is required" };
    }

    if (!salary) {
      throw { status: 400, message: "Salary details are required" };
    }

    if (!payroll) {
      throw { status: 400, message: "Payroll details are required" };
    }

    if (!paidById) {
      throw { status: 401, message: "Authenticated user is required to save payroll" };
    }

    const employee = await Employee.findByPk(employeeId, {
      transaction,
    });

    if (!employee) {
      throw {
        status: 404,
        message: "Employee not found",
      };
    }

    const existing = await PayrollEmployeeDetails.findOne({
      where: {
        employee_id: employeeId,
        economic_year_id: economicYearId,
        month,
        status: "paid",
      },
      transaction,
    });

    if (existing) {
      throw {
        status: 409,
        message: "Employee has already been paid for this period",
      };
    }

    const payrollRow = await Payroll.create(
      {
        employee_id: employeeId,
        month,
        year,

        gross_salary: payroll.earnings?.grossMonthly || 0,
        total_deductions: payroll.absenceDeduction || 0,
        total_bonuses: 0,
        overtime_amount: payroll.otPay || 0,
        net_salary: payroll.netPay || 0,

        status: "paid",
        generated_at: new Date(),
      },
      { transaction }
    );

    const receiptNumber = await generateReceiptNumber(
      economicYearId,
      transaction
    );

    const details = await PayrollEmployeeDetails.create(
      {
        payroll_id: payrollRow.id,
        employee_id: employeeId,

        economic_year_id: economicYearId,
        month,

        period_label: periodLabel,
        period_start_ad: periodStartAD,
        period_end_ad: periodEndAD,

        basic_salary: payroll.earnings?.basic || 0,
        housing_allowance: payroll.earnings?.housing || 0,
        transport_allowance: payroll.earnings?.transport || 0,
        medical_allowance: payroll.earnings?.medical || 0,
        other_allowance: payroll.earnings?.other || 0,
        food_allowance: payroll.earnings?.food || 0,
        accommodation_allowance:
          payroll.earnings?.accommodation || 0,

        gross_monthly_salary:
          payroll.earnings?.grossMonthly || 0,

        daily_working_hours:
          salary.daily_working_hours || 8,

        ot_enabled: salary.ot_enabled || false,

        ot_rate_multiplier:
          salary.ot_rate || 0,

        working_days: payroll.workingDays || 0,

        required_monthly_hours:
          payroll.requiredMonthlyHours || 0,

        hourly_rate: payroll.hourlyRate || 0,

        per_day_rate: payroll.perDayRate || 0,

        total_worked_hours:
          payroll.totalWorkedHours || 0,

        shortfall_hours:
          payroll.shortfallHours || 0,

        unpaid_days:
          payroll.unpaidDays || 0,

        overtime_hours:
          payroll.overtimeHours || 0,

        attendance_summary:
          payroll.summary || {},

        absence_deduction:
          payroll.absenceDeduction || 0,

        ot_pay:
          payroll.otPay || 0,

        other_deductions: otherDeductions,
        other_additions: otherAdditions,

        gross_pay:
          payroll.earnings?.grossMonthly || 0,

        total_deductions:
          payroll.absenceDeduction || 0,

        total_additions:
          payroll.otPay || 0,

        net_pay:
          payroll.netPay || 0,

        receipt_number: receiptNumber,

        payment_date: new Date(),

        payment_method:
          paymentMethod || "cash",

        payment_reference:
          paymentReference || null,

        paid_by_id:
          paidById || null,

        remarks:
          remarks || null,

        status: "paid",
      },
      { transaction }
    );

    await transaction.commit();

    return {
      success: true,
      data: details,
    };
  } catch (error) {
    await transaction.rollback();

    throw {
      status: error.status || 500,
      message:
        error.message ||
        "Failed to save payroll payment",
    };
  }
};

     
//if paid we will not show empoloyee details
export const statusPaid = async (employeeId, economicYearId, month) => {
  try {
    const record = await PayrollEmployeeDetails.findOne({
      where: {
        employee_id: employeeId,
        economic_year_id: economicYearId,
        month,
        status: "paid",
      },
    });

    if (!record) {
      return { paid: false };
    }

    return {
      paid: true,
      receiptNumber: record.receipt_number,
      paymentDate: record.payment_date,
      netPay: record.net_pay,
      periodLabel: record.period_label,
    };
  } catch (err) {
    throw {
      status: 500,
      message: err.message || "Failed to check payroll status",
    };
  }
};

//caluate how much salary paid to the employee in tital .. calucalted from status "paid"
export const calculatePaidSalary = async (economicYearId = null, month = null) => {
  try {
    const where = { status: "paid" };

    if (economicYearId) where.economic_year_id = economicYearId;
    if (month) where.month = month;

    const records = await PayrollEmployeeDetails.findAll({ where });

    const totalGrossSalary = records.reduce((sum, r) => sum + Number(r.gross_pay || 0), 0);
    const totalNetPaid = records.reduce((sum, r) => sum + Number(r.net_pay || 0), 0);

    return {
      success: true,
      totalEmployeesPaid: records.length,
      totalGrossSalary,
      totalNetPaid,
    };
  } catch (err) {
    throw {
      status: err.status || 500,
      message: err.message || "Failed to calculate paid salary",
    };
  }
};

export const getPaidPayrollDetails = async (employeeId, economicYearId, month) => {
  try {
    const record = await PayrollEmployeeDetails.findOne({
      where: {
        employee_id: employeeId,
        economic_year_id: economicYearId,
        month,
        status: "paid",
      },
      include: [{ model: Employee }],
    });

    if (!record) {
      throw { status: 404, message: "No paid record found for this period" };
    }

    return { success: true, data: record };
  } catch (err) {
    throw {
      status: err.status || 500,
      message: err.message || "Failed to fetch paid payroll details",
    };
  }
};

export const getAllPaidPayrollDetails = async () => {
  try {
    const records = await PayrollEmployeeDetails.findAll({
      where: { status: "paid" },
      include: [{ model: Employee }],
      order: [["payment_date", "DESC"]],
    });

    return { success: true, data: records };
  } catch (err) {
    throw {
      status: err.status || 500,
      message: err.message || "Failed to fetch paid payroll records",
    };
  }
};

export const searchRecieptNumber = async (receiptNumber) => {
  try {
    const record = await PayrollEmployeeDetails.findOne({
      where: {
        receipt_number: receiptNumber.trim(),
        status: "paid",
      },
      include: [{ model: Employee }],
    });

    if (!record) {
      throw { status: 404, message: "No paid payroll found for this receipt number" };
    }

    return { success: true, data: record };
  } catch (err) {
    throw {
      status: err.status || 500,
      message: err.message || "Failed to search receipt number",
    };
  }
};