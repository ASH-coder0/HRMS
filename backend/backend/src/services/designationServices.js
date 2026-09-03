const Designation = require('../../models/Designation');
const Department = require('../../models/Department');
const CustomErrorHandler = require('../utils/CustomErrorHandler');

const getAll = async ({ department_id }) => {
  const where = {};
  if (department_id) where.department_id = department_id;
  return Designation.findAll({ where, include: [{ model: Department }], order: [['title', 'ASC']] });
};

const create = async (payload) => {
  return Designation.create(payload);
};

const update = async (id, payload) => {
  const designation = await Designation.findByPk(id);
  if (!designation) throw CustomErrorHandler.notFound('Designation not found');
  await designation.update(payload);
  return designation;
};

const remove = async (id) => {
  const designation = await Designation.findByPk(id);
  if (!designation) throw CustomErrorHandler.notFound('Designation not found');
  await designation.destroy();
};

module.exports = { getAll, create, update, remove };
