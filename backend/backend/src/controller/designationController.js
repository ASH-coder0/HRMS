const { asyncHandler } = require('../middlewares');
const { designationServices } = require('../services');
const { SUCCESS_API_FETCH, DATA_SAVED, DATA_UPDATED, DATA_DELETED } = require('../helpers/response');

const getAll = asyncHandler(async (req, res) => {
  const data = await designationServices.getAll(req.query);
  return res.status(200).json(SUCCESS_API_FETCH(data, 'Designations fetched successfully'));
});

const create = asyncHandler(async (req, res) => {
  const data = await designationServices.create(req.body);
  return res.status(201).json(DATA_SAVED(data, 'Designation created successfully'));
});

const update = asyncHandler(async (req, res) => {
  const data = await designationServices.update(req.params.id, req.body);
  return res.status(200).json(DATA_UPDATED(data, 'Designation updated successfully'));
});

const remove = asyncHandler(async (req, res) => {
  await designationServices.remove(req.params.id);
  return res.status(200).json(DATA_DELETED('Designation deleted successfully'));
});

module.exports = { getAll, create, update, remove };
