const express = require("express");

const router = express.Router();

const { auth, authorize } = require("../middlewares");

const {
  createShiftController,
  getShiftsController,
  getShiftByIdController,
  updateShiftController,
  deleteShiftController,
  assignShiftController,
  getEmployeeShiftsController,
  getAllEmployeeShiftsController,
  removeEmployeeShiftController,
  getMyShiftController,
} = require("../controller/shiftController");

const { HR_ROLES } = require("../constant");

// All shift routes require authentication
router.use(auth);

// GET all shifts
router.get(
  "/",
  authorize(...HR_ROLES),
  getShiftsController
);

// GET MY SHIFT
router.get(
  "/my-shift",
  getMyShiftController
);

// GET single shift
router.get(
  "/:id",
  authorize(...HR_ROLES),
  getShiftByIdController
);

// CREATE shift
router.post(
  "/",
  authorize(...HR_ROLES),
  createShiftController
);

// UPDATE shift
router.put(
  "/:id",
  authorize(...HR_ROLES),
  updateShiftController
);

// DELETE shift
router.delete(
  "/:id",
  authorize(...HR_ROLES),
  deleteShiftController
);

// ASSIGN SHIFT TO EMPLOYEE
router.post(
  "/assign",
  authorize(...HR_ROLES),
  assignShiftController
);

// GET ALL EMPLOYEE SHIFT ASSIGNMENTS
router.get(
  "/assignments/all",
  authorize(...HR_ROLES),
  getAllEmployeeShiftsController
);

// GET SHIFTS ASSIGNED TO ONE EMPLOYEE
router.get(
  "/employee/:employee_id",
  authorize(...HR_ROLES),
  getEmployeeShiftsController
);

// REMOVE EMPLOYEE SHIFT ASSIGNMENT
router.delete(
  "/assignment/:id",
  authorize(...HR_ROLES),
  removeEmployeeShiftController
);

module.exports = router;