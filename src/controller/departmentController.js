const { asyncHandler } = require('../middlewares');
const { departmentServices } = require('../services');
const { SUCCESS_API_FETCH, DATA_SAVED, DATA_UPDATED, DATA_DELETED } = require('../helpers/response');

const getAll = asyncHandler(async (req, res) => {
  const data = await departmentServices.getAll(req.query);
  return res.status(200).json(SUCCESS_API_FETCH(data, 'Departments fetched successfully'));
});

const getById = asyncHandler(async (req, res) => {
  const data = await departmentServices.getById(req.params.id);
  return res.status(200).json(SUCCESS_API_FETCH(data, 'Department fetched successfully'));
});

const create = asyncHandler(async (req, res) => {
  const data = await departmentServices.create(req.body);
  return res.status(201).json(DATA_SAVED(data, 'Department created successfully'));
});

const update = asyncHandler(async (req, res) => {
  const data = await departmentServices.update(req.params.id, req.body);
  return res.status(200).json(DATA_UPDATED(data, 'Department updated successfully'));
});

const remove = asyncHandler(async (req, res) => {
  await departmentServices.remove(req.params.id);
  return res.status(200).json(DATA_DELETED('Department deleted successfully'));
});

module.exports = { getAll, getById, create, update, remove };
