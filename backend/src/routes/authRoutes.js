const express = require('express');
const router = express.Router();
const { authValidation, auth } = require('../middlewares');
const { authController } = require('../controller');

router.post('/register',authValidation.validateRegister,authController.register);
router.post('/login', authValidation.validateLogin, authController.login);
router.post('/refresh', authValidation.validateRefreshToken, authController.refresh);
router.post('/logout', auth, authValidation.validateRefreshToken, authController.logout);
router.post('/forgot-password', authValidation.validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', authValidation.validateResetPassword, authController.resetPassword);
router.get('/me', auth, authController.me);
router.post('/change-password', auth, authController.changePasswordController);

module.exports = router;
