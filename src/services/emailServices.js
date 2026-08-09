const nodemailer = require('nodemailer');
const {
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM,
} = require('../config/constant');
const logger = require('../config/winstonLoggerConfig');

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT) || 587,
  secure: false,
  auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
});

const sendMail = async ({ to, subject, html }) => {
  if (!SMTP_USER) {
    logger.info(`[email:skip - no SMTP configured] to=${to} subject=${subject}`);
    return;
  }
  await transporter.sendMail({ from: SMTP_FROM, to, subject, html });
};

const sendPasswordResetEmail = async (to, resetUrl) => {
  await sendMail({
    to,
    subject: 'Reset your Hospital HRMS password',
    html: `<p>You requested a password reset.</p><p><a href="${resetUrl}">Click here to reset your password</a>. This link expires in 1 hour.</p><p>If you did not request this, please ignore this email.</p>`,
  });
};

module.exports = { sendMail, sendPasswordResetEmail };
