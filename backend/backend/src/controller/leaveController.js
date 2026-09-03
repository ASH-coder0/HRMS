const { asyncHandler } = require('../middlewares');
const { leaveServices } = require('../services');
const { SUCCESS_API_FETCH, DATA_SAVED, DATA_UPDATED } = require('../helpers/response');

const listTypes = asyncHandler(async (req, res) => {
  const data = await leaveServices.listTypes();
  return res.status(200).json(SUCCESS_API_FETCH(data, 'Leave types fetched successfully'));
});

const createType = asyncHandler(async (req, res) => {
  const data = await leaveServices.createType(req.body);
  return res.status(201).json(DATA_SAVED(data, 'Leave type created successfully'));
});

const getBalances = asyncHandler(async (req, res) => {
  const employeeId = req.params.employeeId || req.user.employee_id;
  const data = await leaveServices.getBalances(employeeId, req.query.year);
  return res.status(200).json(SUCCESS_API_FETCH(data, 'Leave balances fetched successfully'));
});

const apply = asyncHandler(async (req, res) => {
  const employee_id = req.body.employee_id || req.user.employee_id;
  const data = await leaveServices.apply({ ...req.body, employee_id });
  return res.status(201).json(DATA_SAVED(data, 'Leave request submitted'));
});

const getAll = asyncHandler(async (req, res) => {
  const data = await leaveServices.getAll(req.query);
  return res.status(200).json(SUCCESS_API_FETCH(data, 'Leave requests fetched successfully'));
});

const departmentApprove = asyncHandler(async (req, res) => {
  const data = await leaveServices.departmentApprove(req.params.id, req.user.user_id);
  return res.status(200).json(DATA_UPDATED(data, 'Leave approved by department'));
});

const hrApprove = asyncHandler(async (req, res) => {
  const data = await leaveServices.hrApprove(req.params.id, req.user.user_id);
  return res.status(200).json(DATA_UPDATED(data, 'Leave approved'));
});

const reject = asyncHandler(async (req, res) => {
  const data = await leaveServices.reject(req.params.id, req.body.reason);
  return res.status(200).json(DATA_UPDATED(data, 'Leave request rejected'));
});

const cancel = asyncHandler(async (req, res) => {
  const data = await leaveServices.cancel(req.params.id);
  return res.status(200).json(DATA_UPDATED(data, 'Leave request cancelled'));
});

module.exports = { listTypes, createType, getBalances, apply, getAll, departmentApprove, hrApprove, reject, cancel };
