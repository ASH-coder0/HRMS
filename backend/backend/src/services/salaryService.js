const { Op } = require("sequelize");
const Salary = require("../../models/Salary");
const Employee = require("../../models/Employee");

const saveSalary = async ({
  employee_id,
  basic_salary,
  basic_salary_multiplier,
  housing_allowance,
  transport_allowance,
  medical_allowance,
  other_allowance,
  food_enabled,
  food_allowance,
  accommodation_enabled,
  accommodation_allowance,
  daily_working_hours,
  ot_enabled,
  ot_rate,
  effective_date,
}) => {
  try {
    // Close out any currently-open salary row for this employee so history
    // is preserved (the new row becomes the active one as of effective_date).
    await Salary.update(
      { end_date: effective_date },
      { where: { employee_id, end_date: null } }
    );

    const salary = await Salary.create({
      employee_id,
      basic_salary,
      basic_salary_multiplier: basic_salary_multiplier ?? 1,
      housing_allowance: housing_allowance || 0,
      transport_allowance: transport_allowance || 0,
      medical_allowance: medical_allowance || 0,
      other_allowance: other_allowance || 0,
      food_enabled: !!food_enabled,
      food_allowance: food_allowance || 0,
      accommodation_enabled: !!accommodation_enabled,
      accommodation_allowance: accommodation_allowance || 0,
      daily_working_hours: daily_working_hours || 8,
      ot_enabled: !!ot_enabled,
      ot_rate: ot_rate ?? 1.5,
      effective_date,
      end_date: null,
    });

    return salary;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const getEmployeeSalaryService = async () => {
  try {
    const salary = await Salary.findAll({
      include: [
        {
          model: Employee,
          attributes: ["id", "first_name", "last_name", "employee_code"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return {
      success: true,
      status: 200,
      data: salary,
    };
  } catch (err) {
    console.error("getEmployeeSalaryService:", err);

    return {
      success: false,
      status: 500,
      message: "Something went wrong while fetching salary",
      error: err.message,
    };
  }
};

// Current (open, end_date IS NULL) salary row for a single employee —
// used to pre-fill the Set Salary form when editing.
const getCurrentSalaryForEmployee = async (employee_id) => {
  try {
    const salary = await Salary.findOne({
      where: { employee_id, end_date: null },
      order: [["effective_date", "DESC"]],
    });

    return {
      success: true,
      status: 200,
      data: salary,
    };
  } catch (err) {
    console.error("getCurrentSalaryForEmployee:", err);

    return {
      success: false,
      status: 500,
      message: "Something went wrong while fetching salary",
      error: err.message,
    };
  }
};

module.exports = {
  saveSalary,
  getEmployeeSalaryService,
  getCurrentSalaryForEmployee,
};