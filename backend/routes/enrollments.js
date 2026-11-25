const express = require('express');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const HttpError = require('../utils/httpError');
const { assertObjectId } = require('../utils/validation');

const router = express.Router();

// GET /api/enrollments -> every enrollment with student and course details
router.get('/', async (req, res) => {
  const enrollments = await Enrollment.find().populate('student').populate('course').sort({ createdAt: -1 }).lean();
  res.json(enrollments.filter((e) => e.student && e.course));
});

// POST /api/enrollments  { student: <student _id>, course: <course _id> }
router.post('/', async (req, res) => {
  const { student: studentRef, course: courseRef } = req.body || {};
  const details = {};
  if (!studentRef) details.student = 'Please select a student';
  if (!courseRef) details.course = 'Please select a course';
  if (Object.keys(details).length) throw new HttpError(400, 'Validation failed', details);

  assertObjectId(studentRef, 'student id');
  assertObjectId(courseRef, 'course id');

  // Referential integrity: both sides must exist.
  const [student, course] = await Promise.all([
    Student.findById(studentRef).lean(),
    Course.findById(courseRef).lean(),
  ]);
  if (!student) throw new HttpError(404, 'The selected student no longer exists');
  if (!course) throw new HttpError(404, 'The selected course no longer exists');

  if (await Enrollment.exists({ student: student._id, course: course._id })) {
    throw new HttpError(409, `${student.name} is already enrolled in ${course.courseId}`);
  }

  const enrollment = await Enrollment.create({ student: student._id, course: course._id });
  res.status(201).json({
    message: `${student.name} enrolled in ${course.courseId}`,
    enrollment: { ...enrollment.toObject(), student, course },
  });
});

// DELETE /api/enrollments/:id -> unenroll
router.delete('/:id', async (req, res) => {
  assertObjectId(req.params.id, 'enrollment id');
  const enrollment = await Enrollment.findByIdAndDelete(req.params.id).lean();
  if (!enrollment) throw new HttpError(404, 'Enrollment not found');
  res.json({ message: 'Enrollment removed', enrollment });
});

module.exports = router;
