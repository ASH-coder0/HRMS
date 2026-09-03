const express = require('express');
const router = express.Router();
const { auth, authorize, designationValidation } = require('../middlewares');
const { designationController } = require('../controller');
const { MANAGE_EMPLOYEE_ROLES, HR_ROLES } = require('../constant');

router.use(auth);

router.get('/', designationController.getAll);
router.post('/', authorize(...MANAGE_EMPLOYEE_ROLES), designationValidation.validateCreateDesignation, designationController.create);
router.put('/:id', authorize(...MANAGE_EMPLOYEE_ROLES), designationValidation.validateUpdateDesignation, designationController.update);
router.delete('/:id', authorize(...HR_ROLES), designationController.remove);

module.exports = router;
