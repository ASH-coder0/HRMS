const {
  createShiftService,
  getShiftsService,
  getShiftByIdService,
  updateShiftService,
  deleteShiftService,
  assignShiftService,
  getEmployeeShiftsService,
  getAllEmployeeShiftsService,
  removeEmployeeShiftService,
} = require("../services/shiftServices");
const EmployeeShift = require("../../models/EmployeeShift");
const Shift = require("../../models/Shift");

// CREATE SHIFT

const createShiftController = async (req, res) => {
  try {
    const {
      name,
      start_time,
      end_time,
      is_night_shift,
    } = req.body;

    const result = await createShiftService({
      name,
      start_time,
      end_time,
      is_night_shift,
    });

    return res.status(result.status).json(result);
  } catch (error) {
    console.error("createShiftController:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// GET ALL SHIFTS

const getShiftsController = async (req, res) => {
  try {
    const result = await getShiftsService();

    return res.status(result.status).json(result);
  } catch (error) {
    console.error("getShiftsController:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// GET SINGLE SHIFT

const getShiftByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await getShiftByIdService(id);

    return res.status(result.status).json(result);
  } catch (error) {
    console.error("getShiftByIdController:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// UPDATE SHIFT

const updateShiftController = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      start_time,
      end_time,
      is_night_shift,
    } = req.body;

    const result = await updateShiftService(id, {
      name,
      start_time,
      end_time,
      is_night_shift,
    });

    return res.status(result.status).json(result);
  } catch (error) {
    console.error("updateShiftController:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// DELETE SHIFT

const deleteShiftController = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteShiftService(id);

    return res.status(result.status).json(result);
  } catch (error) {
    console.error("deleteShiftController:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// ASSIGN SHIFT

const assignShiftController = async (req, res) => {
  try {
    const {
      employee_id,
      shift_id,
      effective_date,
      day_of_week,
    } = req.body;

    const result = await assignShiftService({
      employee_id,
      shift_id,
      effective_date,
      day_of_week,
    });

    return res.status(result.status).json(result);
  } catch (error) {
    console.error("assignShiftController:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// GET EMPLOYEE SHIFTS

const getEmployeeShiftsController = async (req, res) => {
  try {
    const { employee_id } = req.params;

    const result =
      await getEmployeeShiftsService(employee_id);

    return res.status(result.status).json(result);
  } catch (error) {
    console.error("getEmployeeShiftsController:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// GET ALL ASSIGNMENTS

const getAllEmployeeShiftsController = async (req, res) => {
  try {
    const result =
      await getAllEmployeeShiftsService();

    return res.status(result.status).json(result);
  } catch (error) {
    console.error("getAllEmployeeShiftsController:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// REMOVE EMPLOYEE SHIFT

const removeEmployeeShiftController = async (req, res) => {
  try {
    const { id } = req.params;

    const result =
      await removeEmployeeShiftService(id);

    return res.status(result.status).json(result);
  } catch (error) {
    console.error("removeEmployeeShiftController:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getMyShiftController = async (req, res) => {
  try {
    const employeeId = req.user.employee_id ?? req.user.id;

    if (!employeeId) {
      return res.status(400).json({
        status: false,
        message: "No employee record linked to this account",
      });
    }

    const shifts = await EmployeeShift.findAll({
      where: {
        employee_id: employeeId,
      },
      include: [
        {
          model: Shift,
          attributes: [
            "id",
            "name",
            "start_time",
            "end_time",
            "is_night_shift",
          ],
        },
      ],
      order: [["effective_date", "DESC"]],
    });

    return res.status(200).json({
      status: true,
      data: shifts,
    });
  } catch (error) {
    console.error("getMyShiftController error:", error);

    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

module.exports = {
  createShiftController,
  getShiftsController,
  getShiftByIdController,
  updateShiftController,
  deleteShiftController,
  assignShiftController,
  getEmployeeShiftsController,
  getAllEmployeeShiftsController,
  removeEmployeeShiftController,
  getMyShiftController
};