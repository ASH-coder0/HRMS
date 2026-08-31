const payrollService = require('../services/payRoleService');

const getNetSalary = async (req, res, next) => {
  try {
    const { employee_id, month, year, economic_year_id } = req.query;
    const result = await payrollService.calculateNetSalary({ employee_id, month, year, economic_year_id });
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getPeriods = async (req, res, next) => {
  try {
    const { economic_year_id } = req.query;
    const result = await payrollService.listPayrollPeriods(economic_year_id);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNetSalary, getPeriods };
