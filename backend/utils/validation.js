const mongoose = require('mongoose');
const HttpError = require('./httpError');

function assertObjectId(value, label) {
  if (!mongoose.isValidObjectId(value)) {
    throw new HttpError(400, `Invalid ${label}`);
  }
}

// Only accept known string fields from the request body.
function pickStrings(body, fields) {
  const result = {};
  for (const field of fields) {
    const value = body?.[field];
    result[field] = typeof value === 'string' || typeof value === 'number' ? String(value) : undefined;
  }
  return result;
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { assertObjectId, pickStrings, escapeRegex };
