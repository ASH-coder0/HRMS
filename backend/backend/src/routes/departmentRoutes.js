const express = require('express');
const router = express.Router();
const { auth, authorize, departmentValidation } = require('../middlewares');
const { departmentController } = require('../controller');
const { MANAGE_EMPLOYEE_ROLES, HR_ROLES } = require('../constant');

router.use(auth);

router.get('/', departmentController.getAll);
router.get('/:id', departmentController.getById);
router.post('/', authorize(...MANAGE_EMPLOYEE_ROLES), departmentValidation.validateCreateDepartment, departmentController.create);
router.put('/:id', authorize(...MANAGE_EMPLOYEE_ROLES), departmentValidation.validateUpdateDepartment, departmentController.update);
router.delete('/:id', authorize(...HR_ROLES), departmentController.remove);

module.exports = router;
