const Shift = require("../../models/Shift");
const EmployeeShift = require("../../models/EmployeeShift");
const Employee = require("../../models/Employee");


// CREATE SHIFT

const createShiftService = async ({
  name,
  start_time,
  end_time,
  is_night_shift = false,
}) => {
  try {
    if (!name || !start_time || !end_time) {
      return {
        success: false,
        status: 400,
        message: "Name, start time and end time are required",
      };
    }

    const existingShift = await Shift.findOne({
      where: { name: name.trim() },
    });

    if (existingShift) {
      return {
        success: false,
        status: 409,
        message: "A shift with this name already exists",
      };
    }

    const shift = await Shift.create({
      name: name.trim(),
      start_time,
      end_time,
      is_night_shift: Boolean(is_night_shift),
    });

    return {
      success: true,
      status: 201,
      message: "Shift created successfully",
      data: shift,
    };
  } catch (error) {
    console.error("createShiftService:", error);

    return {
      success: false,
      status: 500,
      message: "Something went wrong while creating shift",
      error: error.message,
    };
  }
};


// GET ALL SHIFTS

const getShiftsService = async () => {
  try {
    const shifts = await Shift.findAll({
      order: [["createdAt", "DESC"]],
    });

    return {
      success: true,
      status: 200,
      data: shifts,
    };
  } catch (error) {
    console.error("getShiftsService:", error);

    return {
      success: false,
      status: 500,
      message: "Something went wrong while fetching shifts",
      error: error.message,
    };
  }
};


// GET SINGLE SHIFT

const getShiftByIdService = async (id) => {
  try {
    if (!id) {
      return {
        success: false,
        status: 400,
        message: "Shift id is required",
      };
    }

    const shift = await Shift.findByPk(id);

    if (!shift) {
      return {
        success: false,
        status: 404,
        message: "Shift not found",
      };
    }

    return {
      success: true,
      status: 200,
      data: shift,
    };
  } catch (error) {
    console.error("getShiftByIdService:", error);

    return {
      success: false,
      status: 500,
      message: "Something went wrong",
      error: error.message,
    };
  }
};


// UPDATE SHIFT

const updateShiftService = async (
  id,
  {
    name,
    start_time,
    end_time,
    is_night_shift,
  }
) => {
  try {
    if (!id) {
      return {
        success: false,
        status: 400,
        message: "Shift id is required",
      };
    }

    const shift = await Shift.findByPk(id);

    if (!shift) {
      return {
        success: false,
        status: 404,
        message: "Shift not found",
      };
    }

    if (name) {
      const existingShift = await Shift.findOne({
        where: {
          name: name.trim(),
        },
      });

      if (
        existingShift &&
        Number(existingShift.id) !== Number(id)
      ) {
        return {
          success: false,
          status: 409,
          message: "A shift with this name already exists",
        };
      }
    }

    await shift.update({
      ...(name !== undefined && { name: name.trim() }),
      ...(start_time !== undefined && { start_time }),
      ...(end_time !== undefined && { end_time }),
      ...(is_night_shift !== undefined && {
        is_night_shift: Boolean(is_night_shift),
      }),
    });

    return {
      success: true,
      status: 200,
      message: "Shift updated successfully",
      data: shift,
    };
  } catch (error) {
    console.error("updateShiftService:", error);

    return {
      success: false,
      status: 500,
      message: "Something went wrong while updating shift",
      error: error.message,
    };
  }
};


// DELETE SHIFT

const deleteShiftService = async (id) => {
  try {
    if (!id) {
      return {
        success: false,
        status: 400,
        message: "Shift id is required",
      };
    }

    const shift = await Shift.findByPk(id);

    if (!shift) {
      return {
        success: false,
        status: 404,
        message: "Shift not found",
      };
    }

    const assignedEmployees = await EmployeeShift.count({
      where: {
        shift_id: id,
      },
    });

    if (assignedEmployees > 0) {
      return {
        success: false,
        status: 409,
        message:
          "This shift is assigned to employees and cannot be deleted",
      };
    }

    await shift.destroy();

    return {
      success: true,
      status: 200,
      message: "Shift deleted successfully",
    };
  } catch (error) {
    console.error("deleteShiftService:", error);

    return {
      success: false,
      status: 500,
      message: "Something went wrong while deleting shift",
      error: error.message,
    };
  }
};


// ASSIGN SHIFT TO EMPLOYEE

const assignShiftService = async ({
  employee_id,
  shift_id,
  effective_date,
  day_of_week,
}) => {
  try {
    if (!employee_id || !shift_id || !effective_date) {
      return {
        success: false,
        status: 400,
        message:
          "Employee, shift and effective date are required",
      };
    }

    // Check employee
    const employee = await Employee.findByPk(employee_id);

    if (!employee) {
      return {
        success: false,
        status: 404,
        message: "Employee not found",
      };
    }

    if (employee.status !== "active") {
      return {
        success: false,
        status: 400,
        message: "Shift can only be assigned to an active employee",
      };
    }

    // Check shift
    const shift = await Shift.findByPk(shift_id);

    if (!shift) {
      return {
        success: false,
        status: 404,
        message: "Shift not found",
      };
    }

    // Prevent duplicate assignment
    const existingAssignment = await EmployeeShift.findOne({
      where: {
        employee_id,
        shift_id,
        effective_date,
        ...(day_of_week !== undefined && {
          day_of_week,
        }),
      },
    });

    if (existingAssignment) {
      return {
        success: false,
        status: 409,
        message: "This shift is already assigned to this employee",
      };
    }

    const employeeShift = await EmployeeShift.create({
      employee_id,
      shift_id,
      effective_date,
      day_of_week:
        day_of_week !== undefined ? day_of_week : null,
    });

    const result = await EmployeeShift.findByPk(
      employeeShift.id,
      {
        include: [
          {
            model: Employee,
            attributes: [
              "id",
              "employee_code",
              "first_name",
              "last_name",
              "email",
              "department_id",
              "designation_id",
              "status",
            ],
          },
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
      }
    );

    return {
      success: true,
      status: 201,
      message: "Shift assigned successfully",
      data: result,
    };
  } catch (error) {
    console.error("assignShiftService:", error);

    return {
      success: false,
      status: 500,
      message: "Something went wrong while assigning shift",
      error: error.message,
    };
  }
};


// GET EMPLOYEE SHIFTS

const getEmployeeShiftsService = async (employee_id) => {
  try {
    if (!employee_id) {
      return {
        success: false,
        status: 400,
        message: "Employee id is required",
      };
    }

    const employee = await Employee.findByPk(employee_id);

    if (!employee) {
      return {
        success: false,
        status: 404,
        message: "Employee not found",
      };
    }

    const assignments = await EmployeeShift.findAll({
      where: {
        employee_id,
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
      order: [
        ["effective_date", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    return {
      success: true,
      status: 200,
      data: assignments,
    };
  } catch (error) {
    console.error("getEmployeeShiftsService:", error);

    return {
      success: false,
      status: 500,
      message: "Something went wrong while fetching employee shifts",
      error: error.message,
    };
  }
};

// GET ALL EMPLOYEE SHIFT ASSIGNMENTS

const getAllEmployeeShiftsService = async () => {
  try {
    const assignments = await EmployeeShift.findAll({
      include: [
        {
          model: Employee,
          attributes: [
            "id",
            "employee_code",
            "first_name",
            "last_name",
            "email",
            "department_id",
            "designation_id",
            "status",
          ],
        },
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
      order: [
        ["effective_date", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    return {
      success: true,
      status: 200,
      data: assignments,
    };
  } catch (error) {
    console.error("getAllEmployeeShiftsService:", error);

    return {
      success: false,
      status: 500,
      message: "Something went wrong while fetching shift assignments",
      error: error.message,
    };
  }
};

// REMOVE EMPLOYEE SHIFT

const removeEmployeeShiftService = async (id) => {
  try {
    if (!id) {
      return {
        success: false,
        status: 400,
        message: "Employee shift id is required",
      };
    }

    const assignment = await EmployeeShift.findByPk(id);

    if (!assignment) {
      return {
        success: false,
        status: 404,
        message: "Shift assignment not found",
      };
    }

    await assignment.destroy();

    return {
      success: true,
      status: 200,
      message: "Shift assignment removed successfully",
    };
  } catch (error) {
    console.error("removeEmployeeShiftService:", error);

    return {
      success: false,
      status: 500,
      message: "Something went wrong while removing shift",
      error: error.message,
    };
  }
};


module.exports = {
  createShiftService,
  getShiftsService,
  getShiftByIdService,
  updateShiftService,
  deleteShiftService,
  assignShiftService,
  getEmployeeShiftsService,
  getAllEmployeeShiftsService,
  removeEmployeeShiftService,
};