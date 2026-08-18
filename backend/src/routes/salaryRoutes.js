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

//get 
router.get('/get', authorize(...HR_ROLES), salaryController.getSalaryController)

module.exports = router;