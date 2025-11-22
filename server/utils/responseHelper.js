// Standardized API response helper

const sendSuccess = (res, statusCode, data, message = null, meta = null) => {
  const response = {
    success: true,
    status: statusCode,
    ...(message && { message }),
    ...(meta && { meta }),
    data
  };
  return res.status(statusCode).json(response);
};

const sendError = (res, statusCode, message, errors = null) => {
  // For automated testing compatibility, use simple error format
  const response = {
    error: message,
    ...(errors && { errors })
  };
  return res.status(statusCode).json(response);
};

const sendPaginated = (res, data, pagination) => {
  const response = {
    success: true,
    status: 200,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: pagination.totalPages,
      hasNext: pagination.hasNext,
      hasPrev: pagination.hasPrev
    }
  };
  return res.status(200).json(response);
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated
};

