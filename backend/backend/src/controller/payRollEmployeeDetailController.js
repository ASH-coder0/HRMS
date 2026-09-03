import {
  saveEmployeePayroleDetailsService,
  statusPaid,
  calculatePaidSalary,
  getPaidPayrollDetails,
} from "../services/payRollEmployeeDetailServices.js";

export const saveEmployeeDetailController = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      paidById: req.user.user_id,
    };

    if (!payload || !payload.employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee payment details not found!",
      });
    }

    const result = await saveEmployeePayroleDetailsService(payload);

    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        message: result.error || "Failed to save employee payment",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Employee payment saved successfully",
      data: result.data,
    });
  } catch (err) {
    console.error("Save employee payment error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

// controller
export const checkPayrollStatusController = async (req, res) => {
  try {
    const { employeeId, economicYearId, month } = req.query;

    if (!employeeId || !economicYearId || !month) {
      return res.status(400).json({
        success: false,
        message: "employeeId, economicYearId and month are required",
      });
    }

    const result = await statusPaid(employeeId, economicYearId, month);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to check payroll status",
    });
  }
};


export const calculatePaidSalaryController = async (req, res) => {
  try {
    const { economicYearId, month } = req.query;

    const result = await calculatePaidSalary(
      economicYearId || null,
      month || null
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to calculate paid salary",
    });
  }
};

export const getPaidPayrollDetailsController = async (req, res) => {
  try {
    const { employeeId, economicYearId, month } = req.query;

    if (!employeeId || !economicYearId || !month) {
      return res.status(400).json({
        success: false,
        message: "employeeId, economicYearId and month are required",
      });
    }

    const result = await getPaidPayrollDetails(employeeId, economicYearId, month);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch paid payroll details",
    });
  }
};