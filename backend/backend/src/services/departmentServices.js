const { Op } = require('sequelize');
const Department = require('../../models/Department');
const Employee = require('../../models/Employee');
const CustomErrorHandler = require('../utils/CustomErrorHandler');

const getAll = async ({ search = '', is_active }) => {
  const where = {};
  if (search) where.name = { [Op.like]: `%${search}%` };
  if (is_active !== undefined) where.is_active = is_active === 'true' || is_active === true;
  return Department.findAll({ where, order: [['name', 'ASC']] });
};

const getById = async (id) => {
  const department = await Department.findByPk(id);
  if (!department) throw CustomErrorHandler.notFound('Department not found');
  return department;
};

const create = async (payload) => {
  const existing = await Department.findOne({ where: { name: payload.name } });
  if (existing) throw CustomErrorHandler.alreadyExists('Department with this name already exists');
  return Department.create(payload);
};

const update = async (id, payload) => {
  const department = await Department.findByPk(id);
  if (!department) throw CustomErrorHandler.notFound('Department not found');
  await department.update(payload);
  return department;
};

const remove = async (id) => {
  const department = await Department.findByPk(id);
  if (!department) throw CustomErrorHandler.notFound('Department not found');

  const employeeCount = await Employee.count({ where: { department_id: id } });
  if (employeeCount > 0) {
    throw CustomErrorHandler.validationError('Cannot delete a department that still has employees assigned');
  }
  await department.destroy();
};

module.exports = { getAll, getById, create, update, remove };
