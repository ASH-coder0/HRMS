const recruitmentService = require("../services/recurimentServices");

const saveRecruitmentController = async (req, res) => {
  try {
    const data = {
      ...req.body,
      resume_url: req.file ? `/recruitments/${req.file.filename}` : null,
    };

    const recruitment = await recruitmentService.saveRecruitmentService(data);

    return res.status(201).json({
      success: true,
      message: "Recruitment saved successfully",
      data: recruitment,
    });
  } catch (error) {
    console.error("Save recruitment error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to save recruitment",
    });
  }
};

const getRecruitmentsController = async (req, res) => {
  try {
    const result = await recruitmentService.getRecruitmentsService(req.query);

    return res.status(200).json({
      success: true,
      message: "Recruitments fetched successfully",
      ...result,
    });
  } catch (error) {
    console.error("Get recruitments error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch recruitments",
    });
  }
};

const getRecruitmentByIdController = async (req, res) => {
  try {
    const recruitment = await recruitmentService.getRecruitmentByIdService(
      req.params.id,
    );

    return res.status(200).json({
      success: true,
      message: "Recruitment fetched successfully",
      data: recruitment,
    });
  } catch (error) {
    console.error("Get recruitment by id error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch recruitment",
    });
  }
};

const updateRecruitmentStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { candidate_status, status } = req.body;

    const recruitment = await recruitmentService.updateRecruitmentStatus(
      id,
      candidate_status,
      status,
    );

    return res.status(200).json({
      status: true,
      message: "Recruitment status updated successfully",
      data: recruitment,
    });
  } catch (error) {
    console.error("Update recruitment status error:", error);

    return res.status(error.statusCode || 500).json({
      status: false,
      message: error.message || "Failed to update recruitment status",
    });
  }
};

const deleteRecruitmentController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Recruitment id not found',
      });
    }

    const recruitment =
      await recruitmentService.deleteRecruitmentService(id);

    return res.status(200).json({
      success: true,
      message: 'Recruitment deleted successfully',
      data: recruitment,
    });
  } catch (error) {
    console.error('Delete recruitment error:', error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to delete recruitment',
    });
  }
};

module.exports = {
  saveRecruitmentController,
  getRecruitmentsController,
  getRecruitmentByIdController,
  updateRecruitmentStatusController,
  deleteRecruitmentController
};
