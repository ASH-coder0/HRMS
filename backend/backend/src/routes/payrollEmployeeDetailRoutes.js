const express = require('express');
const router = express.Router();
const { payRollEmployeeDetailController} = require('../controller')
const { auth, authorize } = require('../middlewares');

router.post('/save', auth, authorize('admin', 'super_admin', 'accountant'), payRollEmployeeDetailController.saveEmployeeDetailController);
router.post('/status', auth, authorize('admin', 'super_admin', 'accountant'), payRollEmployeeDetailController.checkPayrollStatusController);

router.get('/total-paid', auth, authorize('admin', 'super_admin', 'accountant'), payRollEmployeeDetailController.calculatePaidSalaryController);
router.get('/paid-details', auth, authorize('admin', 'super_admin', 'accountant'), payRollEmployeeDetailController.getPaidPayrollDetailsController);

module.exports = router;
