const SUCCESS_API_FETCH = (data, message = 'Data found successfully!!!') => ({
  status: true,
  message,
  data,
});

const DATA_NOT_FOUND = (message = 'Data not found!!!') => ({
  status: false,
  message,
});

const DATA_SAVED = (data, message = 'Data saved successfully!!!') => ({
  status: true,
  message,
  data,
});

const DATA_UPDATED = (data, message = 'Data updated successfully!!!') => ({
  status: true,
  message,
  data,
});

const DATA_DELETED = (message = 'Data deleted successfully!!!') => ({
  status: true,
  message,
});

const LOGOUT = () => ({
  status: true,
  message: 'Logged out successfully!!!',
});

const PASSWORD_UPDATED = () => ({
  status: true,
  message: 'Password updated successfully!!!',
});

module.exports = {
  SUCCESS_API_FETCH,
  DATA_NOT_FOUND,
  DATA_SAVED,
  DATA_UPDATED,
  DATA_DELETED,
  LOGOUT,
  PASSWORD_UPDATED,
};
