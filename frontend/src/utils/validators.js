// Client-side checks that mirror the backend schema rules, so users get instant feedback.
// The server still validates everything; these only improve the experience.

export function validateStudent({ name, studentId, phone, zip }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Name is required';
  else if (name.trim().length > 100) errors.name = 'Name must be 100 characters or fewer';

  if (!studentId.trim()) errors.studentId = 'Student ID is required';
  else if (!/^\d{1,10}$/.test(studentId.trim())) errors.studentId = 'Student ID must be 1-10 digits';

  if (!phone.trim()) errors.phone = 'Phone number is required';
  else if (!/^[0-9()+\-.\s]{7,20}$/.test(phone.trim()))
    errors.phone = 'Use digits, spaces, and ( ) + - . only (e.g. 555-1234)';

  if (!zip.trim()) errors.zip = 'ZIP code is required';
  else if (!/^\d{5}(-\d{4})?$/.test(zip.trim())) errors.zip = 'ZIP code must be 5 digits (e.g. 77001)';

  return errors;
}

export function validateCourse({ courseId, name }) {
  const errors = {};
  const id = courseId.trim();
  if (!id) errors.courseId = 'Course ID is required';
  else if (id.length > 20) errors.courseId = 'Course ID must be 20 characters or fewer';
  else if (!/^[A-Za-z0-9][A-Za-z0-9 -]*$/.test(id))
    errors.courseId = 'Use letters, digits, spaces, and hyphens only (e.g. CIS 3339)';

  if (!name.trim()) errors.name = 'Course name is required';
  else if (name.trim().length > 120) errors.name = 'Course name must be 120 characters or fewer';

  return errors;
}
