const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middlewares');
const { salaryController } = require('../controller');
const { HR_ROLES } = require('../constant');

router.use(auth);

//save salary
router.post(
  '/',
  authorize(...HR_ROLES),
  salaryController.saveSalaryController
);

//get all
router.get('/get', authorize(...HR_ROLES), salaryController.getSalaryController)

//get current salary for a single employee (used to pre-fill edit form)
router.get('/employee/:employee_id', authorize(...HR_ROLES), salaryController.getEmployeeCurrentSalaryController)

module.exports = router;