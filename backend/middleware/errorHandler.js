const mongoose = require('mongoose');
const HttpError = require('../utils/httpError');

const DUPLICATE_MESSAGES = {
  studentId: 'A student with this ID already exists',
  courseId: 'A course with this ID already exists',
  student: 'This student is already enrolled in this course',
};

// Converts every error into a consistent JSON shape: { error, details? }
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const details = {};
    for (const [field, fieldError] of Object.entries(err.errors)) {
      details[field] = fieldError.message;
    }
    return res.status(400).json({ error: 'Validation failed', details });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: `Invalid value for ${err.path}` });
  }

  if (err && err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    return res.status(409).json({ error: DUPLICATE_MESSAGES[field] || 'Duplicate record' });
  }

  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must be valid JSON' });
  }

  if (err instanceof mongoose.Error.MongooseServerSelectionError || err?.name === 'MongoNetworkError') {
    return res.status(503).json({ error: 'Database is unavailable. Please try again shortly.' });
  }

  console.error('Unexpected error:', err);
  return res.status(500).json({ error: 'Internal server error' });
}

module.exports = errorHandler;
