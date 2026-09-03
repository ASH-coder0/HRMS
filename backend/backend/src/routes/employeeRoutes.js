const express = require('express');
const router = express.Router();
const { auth, authorize, employeeValidation } = require('../middlewares');
const { employeeController } = require('../controller');
const { imageUpload, documentUpload } = require('../config/multerConfig');
const { MANAGE_EMPLOYEE_ROLES, HR_ROLES } = require('../constant');

router.use(auth);

router.get('/me', employeeController.getMe);

router.get('/', employeeController.getAll);
router.get('/:id', employeeController.getById);
router.post('/', authorize(...MANAGE_EMPLOYEE_ROLES), employeeValidation.validateCreateEmployee, employeeController.create);
router.put('/:id', authorize(...MANAGE_EMPLOYEE_ROLES), employeeValidation.validateUpdateEmployee, employeeController.update);
router.delete('/:id', authorize(...HR_ROLES), employeeController.remove);

router.post('/:id/photo', authorize(...MANAGE_EMPLOYEE_ROLES), imageUpload.single('photo'), employeeController.uploadPhoto);
router.post('/:id/documents', authorize(...MANAGE_EMPLOYEE_ROLES), documentUpload.single('file'), employeeController.uploadDocument);
router.post('/:id/emergency-contacts', authorize(...MANAGE_EMPLOYEE_ROLES), employeeController.addEmergencyContact);
router.post('/:id/education', authorize(...MANAGE_EMPLOYEE_ROLES), employeeController.addEducation);
router.post('/:id/experience', authorize(...MANAGE_EMPLOYEE_ROLES), employeeController.addExperience);

module.exports = router;
