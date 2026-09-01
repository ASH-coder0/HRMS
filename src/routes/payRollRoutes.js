const express = require('express');
const router = express.Router();
const { getNetSalary, getPeriods } = require('../controller/payrollController');
const { auth, authorize } = require('../middlewares');

router.get('/periods', auth, authorize('admin', 'super_admin', 'accountant'), getPeriods);
router.get('/net-salary', auth, authorize('admin', 'super_admin', 'accountant'), getNetSalary);

module.exports = router;
