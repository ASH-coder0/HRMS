const economicYearService = require('../services/economicYearServices');

/**
 * Create or update economic year for logged-in user
 */
const saveEconomicYearController = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const result = await economicYearService.saveEconomicYear(
      req.body,
      user_id
    );

    return res.status(200).json({
      success: true,
      message: 'Economic year saved successfully',
      data: result,
    });
  } catch (error) {
    console.error('Save economic year error:', error);

    return res.status(400).json({
      success: false,
      message:
        error.message || 'Failed to save economic year',
    });
  }
};

/**
 * Get current user's economic year
 */
const getCurrentEconomicYearController = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const result =
      await economicYearService.getCurrentEconomicYear(
        user_id
      );

    return res.status(200).json({
      success: true,
      message: result
        ? 'Economic year fetched successfully'
        : 'No economic year found',
      data: result || null,
    });
  } catch (error) {
    console.error(
      'Get current economic year error:',
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        'Failed to fetch current economic year',
    });
  }
};

/**
 * Get economic year by ID
 */
const getEconomicYearController = async (req, res) => {
  try {
    const { id } = req.params;

    const result =
      await economicYearService.getEconomicYear(id);

    return res.status(200).json({
      success: true,
      message: 'Economic year fetched successfully',
      data: result,
    });
  } catch (error) {
    console.error(
      'Get economic year error:',
      error
    );

    return res.status(404).json({
      success: false,
      message:
        error.message || 'Economic year not found',
    });
  }
};

/**
 * Get all economic years
 */
const getAllEconomicYearsController = async (req, res) => {
  try {
    const result =
      await economicYearService.getAllEconomicYears();

    return res.status(200).json({
      success: true,
      message: 'Economic years fetched successfully',
      data: result,
    });
  } catch (error) {
    console.error(
      'Get economic years error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message || 'Failed to fetch economic years',
    });
  }
};

module.exports = {
  saveEconomicYearController,
  getCurrentEconomicYearController,
  getEconomicYearController,
  getAllEconomicYearsController,
};