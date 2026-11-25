const express = require('express');
const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');
const HttpError = require('../utils/httpError');
const { assertObjectId, pickStrings, escapeRegex } = require('../utils/validation');

const router = express.Router();

// Adds an enrollmentCount field to each student.
async function withEnrollmentCounts(students) {
  const counts = await Enrollment.aggregate([
    { $match: { student: { $in: students.map((s) => s._id) } } },
    { $group: { _id: '$student', count: { $sum: 1 } } },
  ]);
  const byId = new Map(counts.map((c) => [String(c._id), c.count]));
  return students.map((s) => ({ ...s, enrollmentCount: byId.get(String(s._id)) || 0 }));
}

// GET /api/students?search=jo  -> all students, or those whose name contains
// the search text (case-insensitive) or whose student ID matches exactly.
router.get('/', async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const filter = search
    ? { $or: [{ name: { $regex: escapeRegex(search), $options: 'i' } }, { studentId: search }] }
    : {};
  const students = await Student.find(filter).sort({ name: 1, studentId: 1 }).lean();
  res.json(await withEnrollmentCounts(students));
});

// GET /api/students/:id
router.get('/:id', async (req, res) => {
  assertObjectId(req.params.id, 'student id');
  const student = await Student.findById(req.params.id).lean();
  if (!student) throw new HttpError(404, 'Student not found');
  const [withCount] = await withEnrollmentCounts([student]);
  res.json(withCount);
});

// POST /api/students  { name, studentId, phone, zip }
router.post('/', async (req, res) => {
  const data = pickStrings(req.body, ['name', 'studentId', 'phone', 'zip']);
  const student = new Student(data);
  await student.validate();

  if (await Student.exists({ studentId: student.studentId })) {
    throw new HttpError(409, 'A student with this ID already exists');
  }

  await student.save(); // unique index still guards against races
  res.status(201).json({ message: 'Student added successfully', student: { ...student.toObject(), enrollmentCount: 0 } });
});

// DELETE /api/students/:id  -> also removes that student's enrollments
router.delete('/:id', async (req, res) => {
  assertObjectId(req.params.id, 'student id');
  const student = await Student.findById(req.params.id).lean();
  if (!student) throw new HttpError(404, 'Student not found');

  const { deletedCount } = await Enrollment.deleteMany({ student: student._id });
  await Student.deleteOne({ _id: student._id });

  res.json({ message: 'Student deleted successfully', student, removedEnrollments: deletedCount });
});

module.exports = router;
