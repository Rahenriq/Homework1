const mongoose = require('mongoose');

// Normalizes "cis   3339" -> "CIS 3339" so near-duplicates are caught too.
function normalizeCourseId(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').toUpperCase() : value;
}

const courseSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      required: [true, 'Course ID is required'],
      set: normalizeCourseId,
      maxlength: [20, 'Course ID must be 20 characters or fewer'],
      match: [/^[A-Z0-9][A-Z0-9 -]*$/, 'Course ID may contain only letters, digits, spaces, and hyphens'],
    },
    name: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
      maxlength: [120, 'Course name must be 120 characters or fewer'],
    },
  },
  { timestamps: true }
);

courseSchema.index({ courseId: 1 }, { unique: true });

module.exports = mongoose.model('Course', courseSchema);
module.exports.normalizeCourseId = normalizeCourseId;
