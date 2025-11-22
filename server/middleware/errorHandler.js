// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Database constraint violation (e.g., duplicate code)
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Code already exists' });
  }

  // Database connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({ error: 'Database connection failed' });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
};

// 404 handler
const notFoundHandler = (req, res) => {
  res.status(404).json({ error: 'Not found' });
};

module.exports = {
  errorHandler,
  notFoundHandler
};

