const { Op } = require('sequelize');
const Employee = require('../../models/Employee');
const Department = require('../../models/Department');
const Designation = require('../../models/Designation');
const Role = require('../../models/Role');
const EmergencyContact = require('../../models/EmergencyContact');
const Document = require('../../models/Document');
const EmployeeEducation = require('../../models/EmployeeEducation');
const EmployeeExperience = require('../../models/EmployeeExperience');
const CustomErrorHandler = require('../utils/CustomErrorHandler');

const getAll = async ({ page = 1, limit = 10, search = '', department_id, status }) => {
  const pageNumber = parseInt(page, 10) || 1;
  const pageSize = parseInt(limit, 10) || 10;
  const offset = (pageNumber - 1) * pageSize;

  const where = {};
  if (search) {
    where[Op.or] = [
      { first_name: { [Op.like]: `%${search}%` } },
      { last_name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { employee_code: { [Op.like]: `%${search}%` } },
    ];
  }
  if (department_id) where.department_id = department_id;
  if (status) where.status = status;

  const result = await Employee.findAndCountAll({
    where,
    include: [{ model: Department }, { model: Designation }, { model: Role }],
    limit: pageSize,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return {
    items: result.rows,
    total: result.count,
    page: pageNumber,
    totalPages: Math.ceil(result.count / pageSize),
  };
};

const getById = async (id) => {
  const employee = await Employee.findByPk(id, {
    include: [
      { model: Department },
      { model: Designation },
      { model: Role },
      { model: EmergencyContact, as: 'emergencyContacts' },
      { model: Document, as: 'documents' },
      { model: EmployeeEducation, as: 'education' },
      { model: EmployeeExperience, as: 'experience' },
    ],
  });
  if (!employee) throw CustomErrorHandler.notFound('Employee not found');
  return employee;
};

const create = async (payload) => {
  const existing = await Employee.findOne({ where: { email: payload.email } });
  if (existing) throw CustomErrorHandler.alreadyExists('An employee with this email already exists');
  return Employee.create(payload);
};

const update = async (id, payload) => {
  const employee = await Employee.findByPk(id);
  if (!employee) throw CustomErrorHandler.notFound('Employee not found');
  await employee.update(payload);
  return employee;
};

const remove = async (id) => {
  const employee = await Employee.findByPk(id);
  if (!employee) throw CustomErrorHandler.notFound('Employee not found');
  await employee.destroy();
};

const uploadPhoto = async (id, fileUrl) => {
  const employee = await Employee.findByPk(id);
  if (!employee) throw CustomErrorHandler.notFound('Employee not found');
  employee.profile_photo_url = fileUrl;
  await employee.save();
  return employee;
};

const uploadDocument = async (id, file, body) => {
  return Document.create({
    employee_id: id,
    doc_type: body.doc_type || 'other',
    title: body.title || file.originalname,
    file_url: `/uploads/${file.filename}`,
    issued_by: body.issued_by,
    issue_date: body.issue_date || null,
    expiry_date: body.expiry_date || null,
  });
};

const addEmergencyContact = async (id, payload) => {
  return EmergencyContact.create({ ...payload, employee_id: id });
};

const addEducation = async (id, payload) => {
  return EmployeeEducation.create({ ...payload, employee_id: id });
};

const addExperience = async (id, payload) => {
  return EmployeeExperience.create({ ...payload, employee_id: id });
};

module.exports = {
  getAll, getById, create, update, remove,
  uploadPhoto, uploadDocument, addEmergencyContact, addEducation, addExperience,
};
