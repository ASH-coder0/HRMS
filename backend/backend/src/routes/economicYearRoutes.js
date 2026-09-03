const express = require('express');
const router = express.Router();

const { HR_ROLES } = require('../constant');
const { auth, authorize } = require('../middlewares');

const { economicYearController } = require('../controller');

router.use(auth);

// CREATE / UPDATE
router.post(
  '/',
  authorize(...HR_ROLES),
  economicYearController.saveEconomicYearController
);

// CURRENT USER'S ECONOMIC YEAR
router.get(
  '/current',
  economicYearController.getCurrentEconomicYearController
);

// ALL ECONOMIC YEARS
router.get(
  '/years',
  economicYearController.getAllEconomicYearsController
);

// SINGLE ECONOMIC YEAR
router.get(
  '/:id',
  economicYearController.getEconomicYearController
);

module.exports = router;