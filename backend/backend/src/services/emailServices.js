const nodemailer = require('nodemailer');
const logger = require('../config/winstonLoggerConfig');

const  EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_USER = process.env.EMAIL_USER;
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const sendMail = async ({ to, subject, html }) => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    logger.info(`[email:skip - no email configured] to=${to} subject=${subject}`);
    return;
  }

  await transporter.sendMail({
    from: EMAIL_USER,
    to,
    subject,
    html,
  });
};

const sendPasswordResetEmail = async (to, resetUrl) => {
  await sendMail({
    to,
    subject: 'Reset your Hospital HRMS password',
    html: `<p>You requested a password reset.</p><p><a href="${resetUrl}">Click here to reset your password</a>. This link expires in 1 hour.</p><p>If you did not request this, please ignore this email.</p>`,
  });
};

const sendEmployeeWelcomeEmail = async ({
  email,
  firstName,
  employeeCode,
}) => {
  await sendMail({
    to: email,
    subject: 'Welcome to Hospital HRMS',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to Hospital HRMS</h2>

        <p>Dear ${firstName || 'Employee'},</p>

        <p>
          Your employee profile has been successfully created
          in the Hospital HRMS system.
        </p>

        <p>
          <strong>Employee Code:</strong>
          ${employeeCode || 'N/A'}
        </p>

        <p>
          You can now register your HRMS account using
          your registered email address.
        </p>

        <p>
          Please use the same email address that was registered
          with your employee profile.
        </p>

        <br />

        <p>Regards,</p>
        <p><strong>Hospital HRMS</strong></p>
      </div>
    `,
  });
};

const sendLeaveApprovedEmail = async ({
  email,
  firstName,
  startDate,
  endDate,
  totalDays,
}) => {
  await sendMail({
    to: email,
    subject: 'Leave Request Approved - Hospital HRMS',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Leave Request Approved</h2>

        <p>Dear ${firstName || 'Employee'},</p>

        <p>
          Your leave request has been <strong>approved</strong>.
        </p>

        <p>
          <strong>Leave Start Date:</strong> ${startDate}<br />
          <strong>Leave End Date:</strong> ${endDate}<br />
          <strong>Total Days:</strong> ${totalDays}
        </p>

        <p>
          Please check your HRMS account for more details.
        </p>

        <br />

        <p>Regards,</p>
        <p><strong>Hospital HRMS</strong></p>
      </div>
    `,
  });
};

module.exports = {
  sendMail,
  sendPasswordResetEmail,
  sendEmployeeWelcomeEmail,
  sendLeaveApprovedEmail,
};