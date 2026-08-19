const Salary = require("../../models/Salary");
const Employee = require("../../models/Employee");

const saveSalary = async ({
  employee_id,
  basic_salary,
  housing_allowance,
  transport_allowance,
  medical_allowance,
  other_allowance,
  effective_date,
}) => {
  try {
    const salary = await Salary.create({
      employee_id,
      basic_salary,
      housing_allowance: housing_allowance || 0,
      transport_allowance: transport_allowance || 0,
      medical_allowance: medical_allowance || 0,
      other_allowance: other_allowance || 0,
      effective_date,
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

module.exports = {
  saveSalary,
  getEmployeeSalaryService,
};