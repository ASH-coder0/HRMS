const { Op } = require('sequelize');
const Training = require('../../models/Training');
const EmployeeTraining = require('../../models/EmployeeTraining');
const Employee = require('../../models/Employee');
const Notification = require('../../models/Notification');

// ---------- TRAINING CRUD ----------

const createTraining = async (payload) => {
  return Training.create(payload);
};

const listTrainings = async () => {
  return Training.findAll({ order: [['start_date', 'DESC']] });
};

const getTrainingById = async (id, { withEnrollments = false } = {}) => {
  const options = {};

  if (withEnrollments) {
    options.include = [
      {
        model: EmployeeTraining,
        include: [
          {
            model: Employee,
            attributes: ['id', 'name', 'department_id', 'role'],
          },
        ],
      },
    ];
  }

  return Training.findByPk(id, options);
};

const updateTraining = async (id, payload) => {
  const training = await Training.findByPk(id);
  if (!training) return null;

  await training.update(payload);
  return training;
};

const deleteTraining = async (id) => {
  const training = await Training.findByPk(id);
  if (!training) return null;

  await EmployeeTraining.destroy({
    where: { training_id: id },
  });

  await training.destroy();
  return true;
};

// ---------- ENROLLMENT (registration) ----------

const resolveEmployeeIds = async (payload) => {
  if (payload.employee_ids && payload.employee_ids.length) {
    return payload.employee_ids;
  }

  if (payload.department_id) {
    const employees = await Employee.findAll({
      where: { department_id: payload.department_id },
      attributes: ['id'],
    });

    return employees.map((e) => e.id);
  }

  if (payload.role) {
    const employees = await Employee.findAll({
      where: { role: payload.role },
      attributes: ['id'],
    });

    return employees.map((e) => e.id);
  }

  return [];
};

const enrollEmployees = async (trainingId, payload) => {
  const training = await Training.findByPk(trainingId);

  if (!training) {
    const err = new Error('Training not found');
    err.status = 404;
    throw err;
  }

  const employeeIds = await resolveEmployeeIds(payload);

  if (!employeeIds.length) {
    const err = new Error('No employees resolved for enrollment');
    err.status = 400;
    throw err;
  }

  // ---------- CHECK CAPACITY ----------

  if (training.capacity) {
    const existingCount = await EmployeeTraining.count({
      where: {
        training_id: trainingId,
        completion_status: {
          [Op.ne]: 'dropped',
        },
      },
    });

    const availableSlots = training.capacity - existingCount;

    if (availableSlots <= 0) {
      const err = new Error('Training has reached capacity');
      err.status = 400;
      throw err;
    }

    if (employeeIds.length > availableSlots) {
      const err = new Error(
        `Only ${availableSlots} slot(s) remaining, but ${employeeIds.length} employees selected`
      );
      err.status = 400;
      throw err;
    }
  }

  // ---------- CREATE ENROLLMENTS ----------

  const rows = employeeIds.map((employee_id) => ({
    training_id: trainingId,
    employee_id,
    completion_status: 'registered',
  }));

  const created = await EmployeeTraining.bulkCreate(rows, {
    ignoreDuplicates: true,
  });

  // ---------- CREATE NOTIFICATIONS ----------

  const notifications = employeeIds.map((employee_id) => ({
    user_id: employee_id,
    type: 'training',
    title: 'New Training Assigned',
    message: `You have been assigned to the training "${training.title}".`,
    link: `/training/${trainingId}`,
  }));

  if (notifications.length) {
    await Notification.bulkCreate(notifications);
  }

  return created;
};

// ---------- LIST ENROLLMENTS ----------

const listEnrollmentsForTraining = async (trainingId) => {
  return EmployeeTraining.findAll({
    where: { training_id: trainingId },
    include: [
      {
        model: Employee,
        attributes: ['id', 'name', 'department_id', 'role'],
      },
    ],
    order: [['createdAt', 'ASC']],
  });
};

const listEnrollmentsForEmployee = async (employeeId) => {
  return EmployeeTraining.findAll({
    where: { employee_id: employeeId },
    include: [{ model: Training }],
    order: [['createdAt', 'DESC']],
  });
};

// payload: { completion_status, certificate_url? }

const updateEnrollmentStatus = async (enrollmentId, payload) => {
  const enrollment = await EmployeeTraining.findByPk(enrollmentId);

  if (!enrollment) return null;

  const updates = {};

  if (payload.completion_status) {
    updates.completion_status = payload.completion_status;
  }

  if (payload.certificate_url !== undefined) {
    updates.certificate_url = payload.certificate_url;
  }

  await enrollment.update(updates);

  return enrollment;
};

const removeEnrollment = async (enrollmentId) => {
  const enrollment = await EmployeeTraining.findByPk(enrollmentId);

  if (!enrollment) return null;

  await enrollment.destroy();

  return true;
};

// ---------- COMPLIANCE ----------

const getComplianceSummary = async ({ departmentId } = {}) => {
  const employeeWhere = departmentId
    ? { department_id: departmentId }
    : {};

  const enrollments = await EmployeeTraining.findAll({
    include: [
      {
        model: Employee,
        attributes: ['id', 'name', 'department_id'],
        where: employeeWhere,
      },
      {
        model: Training,
        attributes: [
          'id',
          'title',
          'start_date',
          'end_date',
        ],
      },
    ],
  });

  const today = new Date();

  const overdue = enrollments.filter((e) => {
    const endDate = e.Training?.end_date
      ? new Date(e.Training.end_date)
      : null;

    return (
      ['registered', 'in_progress'].includes(e.completion_status) &&
      endDate &&
      endDate < today
    );
  });

  const completed = enrollments.filter(
    (e) => e.completion_status === 'completed'
  );

  const complianceRate = enrollments.length
    ? Math.round((completed.length / enrollments.length) * 100)
    : 0;

  return {
    total_enrollments: enrollments.length,
    completed: completed.length,
    overdue: overdue.length,
    compliance_rate: complianceRate,
    overdue_list: overdue,
  };
};

module.exports = {
  createTraining,
  listTrainings,
  getTrainingById,
  updateTraining,
  deleteTraining,
  enrollEmployees,
  listEnrollmentsForTraining,
  listEnrollmentsForEmployee,
  updateEnrollmentStatus,
  removeEnrollment,
  getComplianceSummary,
};