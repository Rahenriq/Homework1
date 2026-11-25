# Student Management System — Vue 3 + Express + MongoDB

CIS 3339 Homework 1. A full-stack app for managing **students**, **courses**, and **enrollments**.

- **Frontend:** Vue 3 (Composition API, `<script setup>`), Vue Router, Pinia, built with Vite
- **Backend:** Node.js + Express 5 REST API
- **Database:** MongoDB Community Edition (local) through Mongoose

The original assignment instructions are in [ASSIGNMENT.md](ASSIGNMENT.md).

---

## Required software

| Software | Version |
| --- | --- |
| Node.js | 20.19 or newer (22 LTS recommended) |
| npm | comes with Node.js |
| MongoDB Community Edition | 6.0 or newer, running locally on port 27017 |

## Environment variables

The real `.env` file is committed at **`backend/.env`**. It holds only local settings and no secrets:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/cis3339_homework1
PORT=3000
```

| Variable | Purpose | Default |
| --- | --- | --- |
| `MONGODB_URI` | MongoDB connection string (local, no username or password) | required |
| `PORT` | Port the Express server listens on | `3000` |

## 1. Start MongoDB Community Edition

Start the local MongoDB service. You do **not** need to create the database, collections, or indexes yourself.

- **Windows:** MongoDB is normally installed as a service and starts automatically. If it isn't running, open *Services*, find **MongoDB Server**, and click *Start*, or run `net start MongoDB` in an Administrator terminal.
- **macOS (Homebrew):** `brew services start mongodb-community`
- **Linux (systemd):** `sudo systemctl start mongod`

To check that it's running: `mongosh --eval "db.runCommand({ ping: 1 })"`

## 2. Install, build, and start

Run these from the **project root** (the folder that contains this README):

```bash
npm install      # installs backend and frontend dependencies (npm workspaces)
npm run build    # builds the Vue production files into frontend/dist
npm start        # starts Express, which serves the API and the built app
```

## 3. Open the application

**http://localhost:3000**

The server prints `Server is running on http://localhost:3000` and then `Connected to MongoDB (database: cis3339_homework1)`.

On first start, the app creates the `students`, `courses`, and `enrollments` collections and their indexes on its own. No seed, migration, or import step is needed. If MongoDB isn't running yet, the server keeps retrying every 5 seconds and the API returns a clear `503` message until the database is available.

### Development mode (optional)

With hot reload, run these in two terminals:

```bash
npm run dev:backend    # Express on http://localhost:3000 (restarts on change)
npm run dev:frontend   # Vite on http://localhost:5173 (proxies /api to :3000)
```

---

## Features

| Area | What you can do |
| --- | --- |
| **Dashboard** | See how many students, courses, and enrollments there are. |
| **Students** | Add a student (name, student ID, phone, ZIP); search by name (partial, case-insensitive) or by exact student ID; view all students with their course count; delete a student. Deleting a student also removes their enrollments. |
| **Courses** | Add a course (course ID, name); list all courses with their enrollment count; delete a course. Deleting a course also removes its enrollments. Click **Roster** to jump to that course's student list. |
| **Enrollments** | Pick a student and a course from lists loaded from the database and enroll them; pick a course to see every enrolled student; remove a single enrollment. The selected course is kept in the URL (`/enrollments?course=…`), so refreshing the page keeps it. |

### Validation and data integrity

- **Required fields** are checked in the browser (instant feedback) and again on the server through the Mongoose schema rules.
- **Duplicates** are blocked by unique MongoDB indexes:
  - student ID: `studentId`
  - course ID: `courseId`, stored in uppercase with spaces normalized, so `cis  3339` and `CIS 3339` count as the same course
  - enrollment: the compound index on `{ student, course }`

  The API answers a duplicate with **409 Conflict**.
- **Referential integrity:** an enrollment can only be created for a student and a course that exist (otherwise **404**). Deleting a student or a course first deletes its enrollments (cascade).

When you deliberately try a duplicate enrollment, the browser's DevTools console shows the `409 (Conflict)` network response. That's the expected, handled rejection; the app shows the message on the form.

---

## REST API

All responses are JSON. Errors have the shape `{ "error": "message", "details": { "field": "message" } }`.

| Method | Endpoint | Description | Success | Errors |
| --- | --- | --- | --- | --- |
| GET | `/api/health` | Server and database status | 200 | — |
| GET | `/api/students?search=text` | List students (optional search by name or ID) | 200 | — |
| GET | `/api/students/:id` | One student | 200 | 400, 404 |
| POST | `/api/students` | Body `{ name, studentId, phone, zip }` | 201 | 400, 409 |
| DELETE | `/api/students/:id` | Delete student and their enrollments | 200 | 400, 404 |
| GET | `/api/courses` | List courses with `enrollmentCount` | 200 | — |
| POST | `/api/courses` | Body `{ courseId, name }` | 201 | 400, 409 |
| DELETE | `/api/courses/:id` | Delete course and its enrollments | 200 | 400, 404 |
| GET | `/api/courses/:id/students` | Course roster | 200 | 400, 404 |
| GET | `/api/enrollments` | All enrollments (with student and course details) | 200 | — |
| POST | `/api/enrollments` | Body `{ student: <student _id>, course: <course _id> }` | 201 | 400, 404, 409 |
| DELETE | `/api/enrollments/:id` | Remove one enrollment | 200 | 400, 404 |

Any API call returns **503** while MongoDB is unreachable.

---

## Project structure

```
.
├── package.json              # root: npm workspaces + build/start scripts
├── backend/
│   ├── .env                  # committed local MongoDB config (no secrets)
│   ├── server.js             # Express app, serves API + frontend/dist, SPA fallback
│   ├── config/db.js          # connect with retry, auto-create collections/indexes
│   ├── models/               # Student, Course, Enrollment (Mongoose schemas)
│   ├── routes/               # students, courses, enrollments REST routes
│   ├── middleware/errorHandler.js
│   └── utils/
└── frontend/
    ├── index.html
    ├── vite.config.js        # dev proxy /api -> :3000
    └── src/
        ├── main.js           # createApp + Pinia + Router
        ├── App.vue           # layout: header, <RouterView>, toasts, confirm dialog
        ├── router/           # Vue Router (history mode)
        ├── stores/           # Pinia setup stores: students, courses, enrollments, notifications, confirm
        ├── api/client.js     # fetch wrapper for the REST API
        ├── components/       # reusable UI components (forms, tables, fields, status...)
        ├── views/            # Home, Students, Courses, Enrollments, NotFound
        ├── utils/validators.js
        └── assets/main.css
```

### How refreshing a routed page works

Vue Router uses HTML5 history mode (`/students`, `/courses`, …). In production, Express serves `frontend/dist` as static files. Any other `GET` request outside `/api` returns `index.html`, so refreshing `/courses` loads the app instead of returning a 404.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Server logs `MongoDB connection failed … Retrying` | Start MongoDB (see step 1) and confirm `MONGODB_URI` in `backend/.env`. The server reconnects by itself. |
| Page says `Frontend build not found` | Run `npm run build` from the project root, then `npm start`. |
| Blank page or missing modules | Delete `node_modules` and run `npm install` again from the project root. |
| Port 3000 already in use | Stop the other process, or change `PORT` in `backend/.env`. |
