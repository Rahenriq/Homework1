const express = require('express');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const HttpError = require('../utils/httpError');
const { assertObjectId, pickStrings } = require('../utils/validation');

const router = express.Router();

// GET /api/courses -> all courses with an enrollmentCount
router.get('/', async (req, res) => {
  const courses = await Course.find().sort({ courseId: 1 }).lean();
  const counts = await Enrollment.aggregate([{ $group: { _id: '$course', count: { $sum: 1 } } }]);
  const byId = new Map(counts.map((c) => [String(c._id), c.count]));
  res.json(courses.map((c) => ({ ...c, enrollmentCount: byId.get(String(c._id)) || 0 })));
});

// GET /api/courses/:id/students -> roster for one course
router.get('/:id/students', async (req, res) => {
  assertObjectId(req.params.id, 'course id');
  const course = await Course.findById(req.params.id).lean();
  if (!course) throw new HttpError(404, 'Course not found');

  const enrollments = await Enrollment.find({ course: course._id }).populate('student').lean();
  const students = enrollments
    .filter((e) => e.student) // defensive: skip any orphaned record
    .map((e) => ({ ...e.student, enrollmentId: e._id, enrolledAt: e.createdAt }))
    .sort((a, b) => a.name.localeCompare(b.name));

  res.json({ course, students });
});

// POST /api/courses  { courseId, name }
router.post('/', async (req, res) => {
  const data = pickStrings(req.body, ['courseId', 'name']);
  const course = new Course(data);
  await course.validate();

  if (await Course.exists({ courseId: course.courseId })) {
    throw new HttpError(409, 'A course with this ID already exists');
  }

  await course.save();
  res.status(201).json({ message: 'Course added successfully', course: { ...course.toObject(), enrollmentCount: 0 } });
});

// DELETE /api/courses/:id  -> also removes that course's enrollments
router.delete('/:id', async (req, res) => {
  assertObjectId(req.params.id, 'course id');
  const course = await Course.findById(req.params.id).lean();
  if (!course) throw new HttpError(404, 'Course not found');

  const { deletedCount } = await Enrollment.deleteMany({ course: course._id });
  await Course.deleteOne({ _id: course._id });

  res.json({ message: 'Course deleted successfully', course, removedEnrollments: deletedCount });
});

module.exports = router;
