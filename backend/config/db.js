const mongoose = require('mongoose');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

const RETRY_DELAY_MS = 5000;

/**
 * Creates every collection and index the application needs.
 * Safe to run on every startup: existing collections/indexes are left alone,
 * so the app works against an empty or nonexistent database with no manual setup.
 */
async function initializeDatabase() {
  for (const model of [Student, Course, Enrollment]) {
    await model.createCollection();
    await model.syncIndexes();
  }
}

/**
 * Connects to MongoDB and keeps retrying if the server is not reachable yet,
 * so the web server can stay up and report a clear 503 instead of crashing.
 */
async function connectWithRetry(uri) {
  for (;;) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      await initializeDatabase();
      console.log(`Connected to MongoDB (database: ${mongoose.connection.name})`);
      return;
    } catch (error) {
      console.error(`MongoDB connection failed: ${error.message}`);
      console.error(`Is MongoDB Community Edition running at ${uri}? Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await mongoose.disconnect().catch(() => {});
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}

function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}

module.exports = { connectWithRetry, isDatabaseReady };
