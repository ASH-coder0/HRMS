
const EconomicYear = require('../../models/EconomicYear');

const saveEconomicYear = async (data, user_id) => {
  const { economic_year, start_date, end_date } = data;

  if (!user_id) throw new Error('User authentication is required');
  if (!economic_year || !economic_year.trim()) throw new Error('Economic year is required');
  if (!start_date) throw new Error('Start date is required');
  if (!end_date) throw new Error('End date is required');
  if (new Date(end_date) < new Date(start_date)) {
    throw new Error('End date cannot be before start date');
  }

  const cleanEconomicYear = economic_year.trim();

  const [record] = await EconomicYear.upsert(
    {
      user_id,
      economic_year: cleanEconomicYear,
      start_date,
      end_date,
      status: true,
    },
    { conflictFields: ['user_id'] } 
  );

  return record;
};

const getEconomicYear = async (id) => {
  const economicYear = await EconomicYear.findByPk(id);

  if (!economicYear) {
    throw new Error('Economic year not found');
  }

  return economicYear;
};

const getAllEconomicYears = async () => {
  return await EconomicYear.findAll({
    order: [['id', 'DESC']],
  });
};

const getCurrentEconomicYear = async (user_id) => {
  if (!user_id) {
    throw new Error('User authentication is required');
  }

  const economicYear = await EconomicYear.findOne({
    where: {
      user_id,
      status: true,
    },
  });

  return economicYear;
};

module.exports = {
  saveEconomicYear,
  getEconomicYear,
  getAllEconomicYears,
  getCurrentEconomicYear,
};