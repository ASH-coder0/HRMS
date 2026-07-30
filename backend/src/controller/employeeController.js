const { asyncHandler } = require('../middlewares');
const { employeeServices } = require('../services');
const { SUCCESS_API_FETCH, DATA_SAVED, DATA_UPDATED, DATA_DELETED } = require('../helpers/response');

const getAll = asyncHandler(async (req, res) => {
  const data = await employeeServices.getAll(req.query);
  return res.status(200).json(SUCCESS_API_FETCH(data, 'Employees fetched successfully'));
});

const getById = asyncHandler(async (req, res) => {
  const data = await employeeServices.getById(req.params.id);
  return res.status(200).json(SUCCESS_API_FETCH(data, 'Employee fetched successfully'));
});

const create = asyncHandler(async (req, res) => {
  const data = await employeeServices.create(req.body);
  return res.status(201).json(DATA_SAVED(data, 'Employee created successfully'));
});

const update = asyncHandler(async (req, res) => {
  const data = await employeeServices.update(req.params.id, req.body);
  return res.status(200).json(DATA_UPDATED(data, 'Employee updated successfully'));
});

const remove = asyncHandler(async (req, res) => {
  await employeeServices.remove(req.params.id);
  return res.status(200).json(DATA_DELETED('Employee deleted successfully'));
});

const uploadPhoto = asyncHandler(async (req, res) => {
  const data = await employeeServices.uploadPhoto(req.params.id, `/uploads/${req.file.filename}`);
  return res.status(200).json(DATA_UPDATED(data, 'Profile photo updated'));
});

const uploadDocument = asyncHandler(async (req, res) => {
  const data = await employeeServices.uploadDocument(req.params.id, req.file, req.body);
  return res.status(201).json(DATA_SAVED(data, 'Document uploaded'));
});

const addEmergencyContact = asyncHandler(async (req, res) => {
  const data = await employeeServices.addEmergencyContact(req.params.id, req.body);
  return res.status(201).json(DATA_SAVED(data, 'Emergency contact added'));
});

const addEducation = asyncHandler(async (req, res) => {
  const data = await employeeServices.addEducation(req.params.id, req.body);
  return res.status(201).json(DATA_SAVED(data, 'Education record added'));
});

const addExperience = asyncHandler(async (req, res) => {
  const data = await employeeServices.addExperience(req.params.id, req.body);
  return res.status(201).json(DATA_SAVED(data, 'Experience record added'));
});

module.exports = {
  getAll, getById, create, update, remove,
  uploadPhoto, uploadDocument, addEmergencyContact, addEducation, addExperience,
};
