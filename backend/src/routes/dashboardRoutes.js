const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares');
const { dashboardController } = require('../controller');

router.use(auth);

router.get('/cards', dashboardController.getCards);
router.get('/attendance-trend', dashboardController.getAttendanceTrend);
router.get('/department-distribution', dashboardController.getDepartmentDistribution);
router.get('/payroll-expense', dashboardController.getPayrollExpense);
router.get('/gender-distribution', dashboardController.getGenderDistribution);
router.get('/monthly-recruitment', dashboardController.getMonthlyRecruitment);
router.get('/leave-statistics', dashboardController.getLeaveStatistics);
router.get('/recent-activity', dashboardController.getRecentActivity);

module.exports = router;
