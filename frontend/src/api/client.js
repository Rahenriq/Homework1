// Small fetch wrapper: every API call goes through here so errors are handled consistently.

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details || {};
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Make sure the backend is running.', 0);
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(data?.error || `Request failed (${response.status})`, response.status, data?.details);
  }
  return data;
}

export const api = {
  getStudents: (search = '') =>
    request(`/students${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  addStudent: (student) => request('/students', { method: 'POST', body: student }),
  deleteStudent: (id) => request(`/students/${id}`, { method: 'DELETE' }),

  getCourses: () => request('/courses'),
  addCourse: (course) => request('/courses', { method: 'POST', body: course }),
  deleteCourse: (id) => request(`/courses/${id}`, { method: 'DELETE' }),
  getCourseRoster: (id) => request(`/courses/${id}/students`),

  enroll: (studentId, courseId) =>
    request('/enrollments', { method: 'POST', body: { student: studentId, course: courseId } }),
  unenroll: (enrollmentId) => request(`/enrollments/${enrollmentId}`, { method: 'DELETE' }),
};
