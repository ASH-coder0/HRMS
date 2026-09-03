const express = require('express');
const router = express.Router();
const { auth, authorize, leaveValidation } = require('../middlewares');
const { leaveController } = require('../controller');
const { HR_ROLES, DEPARTMENT_APPROVAL_ROLES } = require('../constant');

router.use(auth);

router.get('/types', leaveController.listTypes);
router.post('/types', authorize(...HR_ROLES), leaveController.createType);

router.get('/balances/:employeeId?', leaveController.getBalances);

router.post('/', leaveValidation.validateApplyLeave, leaveController.apply);
router.get('/', leaveController.getAll);

router.patch('/:id/department-approve', authorize(...DEPARTMENT_APPROVAL_ROLES), leaveController.departmentApprove);
router.patch('/:id/hr-approve', authorize(...HR_ROLES), leaveController.hrApprove);
router.patch('/:id/reject', authorize(...DEPARTMENT_APPROVAL_ROLES), leaveValidation.validateRejectLeave, leaveController.reject);
router.patch('/:id/cancel', leaveController.cancel);

module.exports = router;
