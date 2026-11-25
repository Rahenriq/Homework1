const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

const express = require('express');
const { connectWithRetry, isDatabaseReady } = require('./config/db');
const studentRoutes = require('./routes/students');
const courseRoutes = require('./routes/courses');
const enrollmentRoutes = require('./routes/enrollments');
const errorHandler = require('./middleware/errorHandler');
const HttpError = require('./utils/httpError');

const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const DIST_DIR = path.join(__dirname, '..', 'frontend', 'dist');
const INDEX_HTML = path.join(DIST_DIR, 'index.html');

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set. Check backend/.env');
  process.exit(1);
}

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

// ---------- REST API ----------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: isDatabaseReady() ? 'connected' : 'disconnected' });
});

// Every other API route needs the database.
app.use('/api', (req, res, next) => {
  if (!isDatabaseReady()) {
    return next(new HttpError(503, 'Database is unavailable. Make sure MongoDB is running and try again.'));
  }
  next();
});

app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);

app.use('/api', (req, res, next) => next(new HttpError(404, 'API endpoint not found')));

// ---------- Vue production build ----------
app.use(express.static(DIST_DIR));

// History-mode fallback: any non-API GET returns index.html so refreshing
// a routed page such as /courses works instead of returning 404.
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  if (!fs.existsSync(INDEX_HTML)) {
    return res
      .status(503)
      .type('text')
      .send('Frontend build not found. Run "npm run build" from the project root, then restart the server.');
  }
  res.sendFile(INDEX_HTML);
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

connectWithRetry(MONGODB_URI);
