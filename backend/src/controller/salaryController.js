const {
  saveSalary,
  getEmployeeSalaryService,
} = require("../services/salaryService");

const saveSalaryController = async (req, res) => {
  try {
    const {
      employee_id,
      basic_salary,
      housing_allowance,
      transport_allowance,
      medical_allowance,
      other_allowance,
      effective_date,
    } = req.body;

    if (!employee_id || !basic_salary || !effective_date) {
      return res.status(400).json({
        success: false,
        message: "Employee, basic salary and effective date are required",
      });
    }

    const salary = await saveSalary({
      employee_id,
      basic_salary,
      housing_allowance,
      transport_allowance,
      medical_allowance,
      other_allowance,
      effective_date,
    });

    return res.status(201).json({
      success: true,
      message: "Salary saved successfully",
      data: salary,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Failed to save salary",
    });
  }
};

const getSalaryController = async (req, res) => {
  try {
    const result = await getEmployeeSalaryService();

    return res.status(result.status).json(result);
  } catch (error) {
    console.error("getSalaryController:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  saveSalaryController,
  getSalaryController,
};