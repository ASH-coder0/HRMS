
const economicYearService = require('../services/economicYearServices');

const checkEconomicYear = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const year = await economicYearService.getCurrentEconomicYear(user_id);

    if (!year) {
      return res.status(428).json({
        success: false,
        needsSetup: true,
        reason: 'NO_YEAR_EXISTS',
        message: 'Please set up your economic year before continuing.',
      });
    }

    if (new Date() > new Date(year.end_date)) {
      return res.status(428).json({
        success: false,
        needsSetup: true,
        reason: 'YEAR_EXPIRED',
        message: `Economic year '${year.economic_year}' has ended. Please set up the new year.`,
        expiredYear: year,
      });
    }

    req.economicYear = year;
    next();
  } catch (error) {
    console.error('Check economic year error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify economic year',
    });
  }
};

module.exports = { checkEconomicYear };