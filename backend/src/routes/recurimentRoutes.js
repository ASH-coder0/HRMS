const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const { auth, authorize } = require('../middlewares');
const { HR_ROLES } = require('../constant');
const {
  saveRecruitmentController,
  getRecruitmentsController,
  getRecruitmentByIdController,
  updateRecruitmentStatusController,
  deleteRecruitmentController
} = require('../controller/recurimentController');

router.use(auth);

const uploadDir = path.join(__dirname, '../public/recruitments');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      `${Date.now()}-${Math.round(Math.random() * 1e9)}` +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowed.includes(ext)) {
      return cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }

    cb(null, true);
  },
});

// list recruitments/candidates
router.get('/', authorize(...HR_ROLES), getRecruitmentsController);

// get single recruitment
router.get('/:id', authorize(...HR_ROLES), getRecruitmentByIdController);

// save recruitment
router.post(
  '/',
  authorize(...HR_ROLES),
  upload.single('resume'),
  saveRecruitmentController
);

//update
router.put(
  '/:id/status',
  authorize(...HR_ROLES),
  updateRecruitmentStatusController
);

//deleet 
router.delete('/:id', authorize(...HR_ROLES), deleteRecruitmentController)

module.exports = router;