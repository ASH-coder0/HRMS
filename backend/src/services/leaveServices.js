const LeaveRequest = require("../../models/LeaveRequest");
const LeaveType = require("../../models/LeaveType");
const LeaveBalance = require("../../models/LeaveBalance");
const Employee = require("../../models/Employee");
const Department = require("../../models/Department");
const CustomErrorHandler = require("../utils/CustomErrorHandler");
const { daysBetweenInclusive } = require("../helpers/date");
const notificationService = require("./notificationServices");
const { sendLeaveApprovedEmail } = require('./emailServices');
const logger = require("../config/winstonLoggerConfig");

const listTypes = async () => LeaveType.findAll({ order: [["name", "ASC"]] });

const createType = async (payload) => LeaveType.create(payload);

const getBalances = async (employeeId, year = new Date().getFullYear()) => {
  return LeaveBalance.findAll({
    where: {
      employee_id: employeeId,
      year,
    },
    include: [LeaveType],
  });
};

const apply = async ({
  employee_id,
  leave_type_id,
  start_date,
  end_date,
  reason,
}) => {
  const total_days = daysBetweenInclusive(start_date, end_date);
  const year = new Date(start_date).getFullYear();

  const balance = await LeaveBalance.findOne({
    where: {
      employee_id,
      leave_type_id,
      year,
    },
  });

  if (balance) {
    const remaining =
      Number(balance.allocated_days) +
      Number(balance.carried_forward_days) -
      Number(balance.used_days);

    if (total_days > remaining) {
      throw CustomErrorHandler.validationError(
        `Insufficient leave balance. Remaining: ${remaining} day(s)`,
      );
    }
  }

  const leave = await LeaveRequest.create({
    employee_id,
    leave_type_id,
    start_date,
    end_date,
    total_days,
    reason,
    status: "pending",
  });

  await notificationService.leaveNotification(employee_id);

  return leave;
};

const getAll = async ({
  employee_id,
  department_id,
  status,
  page = 1,
  limit = 20,
}) => {
  const pageNumber = parseInt(page, 10) || 1;
  const pageSize = parseInt(limit, 10) || 20;

  const where = {};

  if (employee_id) where.employee_id = employee_id;
  if (status) where.status = status;

  const employeeWhere = department_id ? { department_id } : undefined;

  const result = await LeaveRequest.findAndCountAll({
    where,
    include: [
      {
        model: Employee,
        where: employeeWhere,
        include: [Department],
      },
      {
        model: LeaveType,
      },
    ],
    limit: pageSize,
    offset: (pageNumber - 1) * pageSize,
    order: [["createdAt", "DESC"]],
  });

  return {
    items: result.rows,
    total: result.count,
    page: pageNumber,
    totalPages: Math.ceil(result.count / pageSize),
  };
};

const findRequestOrFail = async (id) => {
  const request = await LeaveRequest.findByPk(id);

  if (!request) {
    throw CustomErrorHandler.notFound("Leave request not found");
  }

  return request;
};

const departmentApprove = async (id, approverId) => {
  const request = await findRequestOrFail(id);

  if (request.status !== "pending") {
    throw CustomErrorHandler.validationError(
      "Only pending requests can be department-approved",
    );
  }

  request.status = "dept_approved";
  request.department_approver_id = approverId;
  request.department_approved_at = new Date();

  await request.save();

  return request;
};

const hrApprove = async (id, approverId) => {
  const request = await findRequestOrFail(id);

  if (!["pending", "dept_approved"].includes(request.status)) {
    throw CustomErrorHandler.validationError(
      "This request is not awaiting HR approval",
    );
  }

  request.status = "approved";
  request.hr_approver_id = approverId;
  request.hr_approved_at = new Date();

  await request.save();

  const year = new Date(request.start_date).getFullYear();

  const [balance] = await LeaveBalance.findOrCreate({
    where: {
      employee_id: request.employee_id,
      leave_type_id: request.leave_type_id,
      year,
    },
    defaults: {
      allocated_days: 0,
      used_days: 0,
      carried_forward_days: 0,
    },
  });

  balance.used_days =
    Number(balance.used_days) + Number(request.total_days);

  await balance.save();

  const employee = await Employee.findByPk(request.employee_id);

  logger.info(
    `hrApprove: leave_request_id=${id}, employee_id=${request.employee_id}, email=${employee?.email || "NONE"}`,
  );

  if (employee?.email) {
    try {
      await sendLeaveApprovedEmail({
        email: employee.email,
        firstName: employee.first_name,
        startDate: request.start_date,
        endDate: request.end_date,
        totalDays: request.total_days,
      });

      logger.info(
        `hrApprove: leave approval email sent to ${employee.email} for leave_request_id=${id}`,
      );
    } catch (err) {
      logger.error(
        `hrApprove: failed to send leave approval email for leave_request_id=${id} - ${err.message}`,
      );
    }
  } else {
    logger.warn(
      `hrApprove: no email on file for employee_id=${request.employee_id}, skipping leave approval email`,
    );
  }

  return request;
};

const reject = async (id, reason) => {
  const request = await findRequestOrFail(id);

  if (["approved", "rejected", "cancelled"].includes(request.status)) {
    throw CustomErrorHandler.validationError(
      "This request can no longer be rejected",
    );
  }

  request.status = "rejected";
  request.rejection_reason = reason || null;

  await request.save();

  return request;
};

const cancel = async (id) => {
  const request = await findRequestOrFail(id);

  if (request.status === "approved") {
    throw CustomErrorHandler.validationError(
      "Approved leave cannot be self-cancelled; ask HR to reverse it",
    );
  }

  request.status = "cancelled";

  await request.save();

  return request;
};


module.exports = {
  listTypes,
  createType,
  getBalances,
  apply,
  getAll,
  departmentApprove,
  hrApprove,
  reject,
  cancel,
};
