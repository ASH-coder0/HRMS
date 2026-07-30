const { asyncHandler } = require('../middlewares');
const { authServices } = require('../services');
const { DATA_SAVED, LOGOUT } = require('../helpers/response');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authServices.login(email, password);
  return res.status(200).json({ status: true, message: 'Login successful', data: result });
});

const logout = asyncHandler(async (req, res) => {
  const { refresh_token } = req.body;
  await authServices.logout(refresh_token);
  return res.status(200).json(LOGOUT());
});

const refresh = asyncHandler(async (req, res) => {
  const { refresh_token } = req.body;
  const result = await authServices.refresh(refresh_token);
  return res.status(200).json({ status: true, message: 'Token refreshed', data: result });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await authServices.forgotPassword(email);
  return res.status(200).json({ status: true, message: 'If an account exists for that email, a reset link has been sent.' });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, token, new_password } = req.body;
  await authServices.resetPassword(email, token, new_password);
  return res.status(200).json({ status: true, message: 'Password has been reset. Please log in.' });
});

const me = asyncHandler(async (req, res) => {
  const user = await authServices.me(req.user.user_id);
  return res.status(200).json({ status: true, message: 'User fetched successfully', data: user });
});

module.exports = { login, logout, refresh, forgotPassword, resetPassword, me };
