const { sendError } = require('../utils/responseHelper');

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Database constraint violation (e.g., duplicate code)
  if (err.code === '23505') {
    return sendError(res, 409, 'Code already exists');
  }

  // Database connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return sendError(res, 503, 'Database connection failed');
  }

  // Default error
  return sendError(res, err.status || 500, err.message || 'Internal server error');
};

// 404 handler
const notFoundHandler = (req, res) => {
  return sendError(res, 404, 'Route not found');
};

module.exports = {
  errorHandler,
  notFoundHandler
};

