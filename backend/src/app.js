require('dotenv').config();
const express = require('express');
const app = express();
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const logger = require('./config/winstonLoggerConfig');
const errorHandler = require('./utils/errorHandler');
const rateLimiter = require('./middlewares/rateLimiter');
const { NODE_ENV, REACT_APP_URL, REACT_ADMIN_APP_URL } = require('./config/constant');

const {
  authRoutes,
  employeeRoutes,
  departmentRoutes,
  designationRoutes,
  attendanceRoutes,
  leaveRoutes,
  dashboardRoutes,
  notificationRoutes,
} = require('./routes');

// CORS Options
const corsOptions = {
  origin: [REACT_APP_URL, REACT_ADMIN_APP_URL, 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
};

// Apply CORS and security middleware
app.use(cors(corsOptions));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// CORP header for uploaded file/image access
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

// Serve uploaded files (photos, documents)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.get('/api/health', (req, res) => res.json({ status: true, message: 'ok', time: new Date().toISOString() }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/designations', designationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
// Error handling & 404
app.use(errorHandler);
app.use((req, res) => {
  logger.info(`404: ${req.url}`);
  res.status(404).json({ status: false, message: 'Page not found !!!' });
});

module.exports = app;
