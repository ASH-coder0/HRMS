const express = require('express');
const router = express.Router();

const { auth, authorize } = require('../middlewares');
const { HR_ROLES } = require('../constant'); 
const {
  saveTrainingController,
  getTrainingsController,
  getTrainingByIdController,
  updateTrainingController,
  deleteTrainingController,
  enrollEmployeesController,
  getTrainingEnrollmentsController,
  getMyTrainingsController,
  updateEnrollmentStatusController,
  deleteEnrollmentController,
  getComplianceSummaryController,
} = require('../controller/trainingController');

router.use(auth);


router.get('/my', getMyTrainingsController);

router.get(
  '/compliance',
  authorize(...HR_ROLES, 'department_head'),
  getComplianceSummaryController
);

// Training CRUD
router.get('/', getTrainingsController); 
router.get('/:id', getTrainingByIdController); 

router.post('/', authorize(...HR_ROLES), saveTrainingController);
router.put('/:id', authorize(...HR_ROLES), updateTrainingController);
router.delete('/:id', authorize(...HR_ROLES), deleteTrainingController);

// Enrollment (EmployeeTraining)
router.post(
  '/:id/enroll',
  authorize(...HR_ROLES, 'department_head'),
  enrollEmployeesController
);

router.get(
  '/:id/enrollments',
  authorize(...HR_ROLES, 'department_head'),
  getTrainingEnrollmentsController
);

router.put('/enrollments/:enrollmentId/status', updateEnrollmentStatusController);

router.delete(
  '/enrollments/:enrollmentId',
  authorize(...HR_ROLES, 'department_head'),
  deleteEnrollmentController
);

module.exports = router;