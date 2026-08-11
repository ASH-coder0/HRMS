const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const jwtServices = require('./jwtServices');
const emailServices = require('./emailServices');
const User = require('../../models/User');
const Role = require('../../models/Role');
const RefreshToken = require('../../models/RefreshToken');
const CustomErrorHandler = require('../utils/CustomErrorHandler');
const Employee = require('../../models/Employee');
const {
  JWT_SECRET, JWT_EXPIRY, REFRESH_SECRET, REFRESH_EXPIRY, REACT_APP_URL,
} = require('../config/constant');

const buildPayload = (user) => ({
  user_id: user.id,
  email: user.email,
  role: user.Role.name,
  employee_id: user.employee_id,
});

const issueTokens = async (user) => {
  const payload = buildPayload(user);
  const access_token = jwtServices.generateToken(payload, JWT_SECRET, JWT_EXPIRY);
  const refresh_token = jwtServices.generateToken(payload, REFRESH_SECRET, REFRESH_EXPIRY);
  await RefreshToken.create({ user_id: user.id, token: refresh_token });
  return { access_token, refresh_token, userInfo: payload };
};

//register
const register = async (email, password) => {
  // 1. Check whether the email belongs to an employee
  const employee = await Employee.findOne({
    where: { email },
  });

  if (!employee) {
    throw CustomErrorHandler.validationError(
      'This email is not registered as an employee. Please contact the administrator.'
    );
  }

  // 2. Check whether this employee already has a login account
  const existingUser = await User.findOne({
    where: {
      employee_id: employee.id,
    },
  });

  if (existingUser) {
    throw CustomErrorHandler.validationError(
      'An account already exists for this employee.'
    );
  }

  // 3. Also prevent duplicate email in users table
  const existingEmail = await User.findOne({
    where: { email },
  });

  if (existingEmail) {
    throw CustomErrorHandler.validationError(
      'An account already exists with this email.'
    );
  }

  // 4. Get the employee's role
  // Adjust this depending on your Employee model.
  const roleId = employee.role_id;

  if (!roleId) {
    throw CustomErrorHandler.validationError(
      'No role has been assigned to this employee.'
    );
  }

  // 5. Create user account
  const user = await User.create({
    email: employee.email,
    password,
    employee_id: employee.id,
    role_id: roleId,
    is_active: true,
  });

  // 6. Fetch user with role for response
  const createdUser = await User.findByPk(user.id, {
    include: [Role],
  });

  return {
    message: 'Registration successful. You can now login.',
    user: {
      user_id: createdUser.id,
      email: createdUser.email,
      role: createdUser.Role.name,
      employee_id: createdUser.employee_id,
    },
  };
};

const login = async (email, password) => {
  const user = await User.findOne({ where: { email }, include: [Role] });
  if (!user || !user.is_active) throw CustomErrorHandler.wrongCredentials();

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw CustomErrorHandler.wrongCredentials();

  user.last_login_at = new Date();
  await user.save();

  return issueTokens(user);
};

const logout = async (refresh_token) => {
  await RefreshToken.destroy({ where: { token: refresh_token } });
};

const refresh = async (refresh_token) => {
  const stored = await RefreshToken.findOne({ where: { token: refresh_token } });
  if (!stored) throw CustomErrorHandler.unAuthorized('Refresh token no longer valid');

  let decoded;
  try {
    decoded = jwtServices.verify(refresh_token, REFRESH_SECRET);
  } catch {
    await stored.destroy();
    throw CustomErrorHandler.unAuthorized('Refresh token expired');
  }

  const user = await User.findByPk(decoded.user_id, { include: [Role] });
  if (!user || !user.is_active) throw CustomErrorHandler.unAuthorized('Account not found or inactive');

  await stored.destroy();
  return issueTokens(user);
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ where: { email } });
  // Always resolve silently to avoid leaking which emails are registered.
  if (!user) return;

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.reset_password_token = crypto.createHash('sha256').update(rawToken).digest('hex');
  user.reset_password_expires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const resetUrl = `${REACT_APP_URL}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;
  await emailServices.sendPasswordResetEmail(email, resetUrl);
};

const resetPassword = async (email, token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    where: {
      email,
      reset_password_token: hashedToken,
      reset_password_expires: { [Op.gt]: new Date() },
    },
  });
  if (!user) throw CustomErrorHandler.validationError('Reset link is invalid or has expired');

  user.password = await bcrypt.hash(newPassword, 10);
  user.reset_password_token = null;
  user.reset_password_expires = null;
  await user.save();
  await RefreshToken.destroy({ where: { user_id: user.id } });
};

const me = async (userId) => {
  const user = await User.findByPk(userId, {
    include: [Role],
    attributes: { exclude: ['password', 'reset_password_token'] },
  });
  if (!user) throw CustomErrorHandler.notFound('User not found');
  return user;
};

module.exports = { register,login, logout, refresh, forgotPassword, resetPassword, me };
