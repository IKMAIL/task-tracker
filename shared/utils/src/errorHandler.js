const logger = require('./logger');

// Express error-handling middleware — attach to app after all routes
module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) {
    logger.error(err.message, { stack: err.stack, path: req.path });
  }
  res.status(status).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      ...(err.code ? { code: err.code } : {}),
    },
  });
};
