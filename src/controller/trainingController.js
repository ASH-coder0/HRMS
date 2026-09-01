const trainingService = require('../services/traininngServices');

// TRAINING CRUD

const saveTrainingController = async (req, res) => {
  try {
    const training = await trainingService.createTraining(req.body);
    return res.status(201).json({ message: 'Training created', data: training });
  } catch (err) {
    console.error('saveTrainingController error:', err);
    return res.status(err.status || 500).json({ message: err.message || 'Failed to create training' });
  }
};

const getTrainingsController = async (req, res) => {
  try {
    const trainings = await trainingService.listTrainings();
    return res.status(200).json({ data: trainings });
  } catch (err) {
    console.error('getTrainingsController error:', err);
    return res.status(500).json({ message: 'Failed to fetch trainings' });
  }
};

const getTrainingByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const withEnrollments = req.query.include === 'enrollments';

    const training = await trainingService.getTrainingById(id, { withEnrollments });

    if (!training) {
      return res.status(404).json({ message: 'Training not found' });
    }

    return res.status(200).json({ data: training });
  } catch (err) {
    console.error('getTrainingByIdController error:', err);
    return res.status(500).json({ message: 'Failed to fetch training' });
  }
};

const updateTrainingController = async (req, res) => {
  try {
    const { id } = req.params;
    const training = await trainingService.updateTraining(id, req.body);

    if (!training) {
      return res.status(404).json({ message: 'Training not found' });
    }

    return res.status(200).json({ message: 'Training updated', data: training });
  } catch (err) {
    console.error('updateTrainingController error:', err);
    return res.status(500).json({ message: 'Failed to update training' });
  }
};

const deleteTrainingController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await trainingService.deleteTraining(id);

    if (!result) {
      return res.status(404).json({ message: 'Training not found' });
    }

    return res.status(200).json({ message: 'Training deleted' });
  } catch (err) {
    console.error('deleteTrainingController error:', err);
    return res.status(500).json({ message: 'Failed to delete training' });
  }
};

// ENROLLMENT

// body: { employee_ids: [] } OR { department_id } OR { role }
const enrollEmployeesController = async (req, res) => {
  try {
    const { id } = req.params;
    const enrollments = await trainingService.enrollEmployees(id, req.body);

    return res.status(201).json({
      message: `${enrollments.length} employee(s) enrolled`,
      data: enrollments,
    });
  } catch (err) {
    console.error('enrollEmployeesController error:', err);
    return res.status(err.status || 500).json({ message: err.message || 'Failed to enroll employees' });
  }
};

const getTrainingEnrollmentsController = async (req, res) => {
  try {
    const { id } = req.params;
    const enrollments = await trainingService.listEnrollmentsForTraining(id);
    return res.status(200).json({ data: enrollments });
  } catch (err) {
    console.error('getTrainingEnrollmentsController error:', err);
    return res.status(500).json({ message: 'Failed to fetch enrollments' });
  }
};

const getMyTrainingsController = async (req, res) => {
  try {
    const employeeId = req.user.employee_id; // adjust to how auth attaches this
    const enrollments = await trainingService.listEnrollmentsForEmployee(employeeId);
    return res.status(200).json({ data: enrollments });
  } catch (err) {
    console.error('getMyTrainingsController error:', err);
    return res.status(500).json({ message: 'Failed to fetch your trainings' });
  }
};

// body: { completion_status, certificate_url? }
const updateEnrollmentStatusController = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const enrollment = await trainingService.updateEnrollmentStatus(enrollmentId, req.body);

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    return res.status(200).json({ message: 'Enrollment updated', data: enrollment });
  } catch (err) {
    console.error('updateEnrollmentStatusController error:', err);
    return res.status(500).json({ message: 'Failed to update enrollment' });
  }
};

const deleteEnrollmentController = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const result = await trainingService.removeEnrollment(enrollmentId);

    if (!result) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    return res.status(200).json({ message: 'Enrollment removed' });
  } catch (err) {
    console.error('deleteEnrollmentController error:', err);
    return res.status(500).json({ message: 'Failed to remove enrollment' });
  }
};

// COMPLIANCE

const getComplianceSummaryController = async (req, res) => {
  try {
    const departmentId =
      req.user.role === 'department_head'
        ? req.user.department_id
        : req.query.department_id;

    const summary = await trainingService.getComplianceSummary({ departmentId });
    return res.status(200).json({ data: summary });
  } catch (err) {
    console.error('getComplianceSummaryController error:', err);
    return res.status(500).json({ message: 'Failed to fetch compliance summary' });
  }
};

module.exports = {
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
};