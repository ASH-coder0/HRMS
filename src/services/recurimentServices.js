const { Op } = require("sequelize");
const Recruitment = require("../../models/Recruitment");
const Department = require("../../models/Department");
const Designation = require("../../models/Designation");

const saveRecruitmentService = async (data) => {
  const recruitment = await Recruitment.create({
    job_title: data.job_title,
    department_id: data.department_id,
    designation_id: data.designation_id || null,
    description: data.description || null,
    openings: data.openings || 1,
    status: data.status || "open",

    candidate_name: data.candidate_name || null,
    candidate_email: data.candidate_email || null,
    candidate_phone: data.candidate_phone || null,
    resume_url: data.resume_url || null,
    candidate_status: data.candidate_status || "applied",
    offer_letter_url: data.offer_letter_url || null,
  });

  return recruitment;
};

const getRecruitmentsService = async (query) => {
  const {
    page = 1,
    limit = 20,
    status,
    candidate_status,
    department_id,
    search,
  } = query;

  const where = {};

  if (status) where.status = status;
  if (candidate_status) where.candidate_status = candidate_status;
  if (department_id) where.department_id = department_id;

  if (search) {
    where[Op.or] = [
      { job_title: { [Op.like]: `%${search}%` } },
      { candidate_name: { [Op.like]: `%${search}%` } },
      { candidate_email: { [Op.like]: `%${search}%` } },
    ];
  }

  const offset = (Number(page) - 1) * Number(limit);

  const { rows, count } = await Recruitment.findAndCountAll({
    where,
    include: [
      { model: Department, attributes: ["id", "name"] },
      { model: Designation, attributes: ["id", "title"] },
    ],
    order: [["createdAt", "DESC"]],
    limit: Number(limit),
    offset,
  });

  return {
    data: rows,
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / Number(limit)),
    },
  };
};

const getRecruitmentByIdService = async (id) => {
  const recruitment = await Recruitment.findByPk(id, {
    include: [
      { model: Department, attributes: ["id", "name"] },
      { model: Designation, attributes: ["id", "title"] },
    ],
  });

  if (!recruitment) {
    const error = new Error("Recruitment not found");
    error.statusCode = 404;
    throw error;
  }

  return recruitment;
};

const updateRecruitmentStatus = async (id, candidate_status, status) => {
  const recruitment = await Recruitment.findByPk(id);

  if (!recruitment) {
    throw new Error("Recruitment not found");
  }

  if (candidate_status) {
    recruitment.candidate_status = candidate_status;
  }

  if (status) {
    recruitment.status = status;
  }

  await recruitment.save();

  return recruitment;
};

const deleteRecruitmentService = async (id) => {
  const recruitment = await Recruitment.findByPk(id);
  if (!recruitment) {
    const error = new Error("Recruitment not found");
    error.statusCode = 404;
    throw error;
  }
  await recruitment.destroy();
  return recruitment;
};
module.exports = {
  saveRecruitmentService,
  getRecruitmentsService,
  getRecruitmentByIdService,
  updateRecruitmentStatus,
  deleteRecruitmentService
};
