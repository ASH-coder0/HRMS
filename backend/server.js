const app = require('./src/app');
const { PORT } = require('./src/config/constant');
const logger = require('./src/config/winstonLoggerConfig');
const sequelize = require('./config/database');

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connected successfully!!!');
  } catch (err) {
    logger.error(`Unable to connect to the database: ${err.message}`);
  }

  app.listen(PORT, () => {
    logger.info(`Server is listening at http://localhost:${PORT}`);
  });
};

startServer();
