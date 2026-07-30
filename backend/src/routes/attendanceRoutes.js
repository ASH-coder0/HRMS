const express = require('express');
const router = express.Router();
const { auth, authorize, attendanceValidation } = require('../middlewares');
const { attendanceController } = require('../controller');
const { MANAGE_ATTENDANCE_ROLES } = require('../constant');

router.use(auth);

router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.post('/manual', authorize(...MANAGE_ATTENDANCE_ROLES), attendanceValidation.validateManualEntry, attendanceController.manualEntry);
router.get('/', attendanceController.getAll);
router.get('/monthly-report', attendanceController.monthlyReport);

module.exports = router;
