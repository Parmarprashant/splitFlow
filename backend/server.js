const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SplitFlow API Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/groups', require('./src/routes/group.routes'));
app.use('/api/expenses', require('./src/routes/expense.routes'));
app.use('/api/settlements', require('./src/routes/settlement.routes'));
app.use('/api/activities', require('./src/routes/activity.routes'));
app.use('/api/seed', require('./src/routes/seed.routes'));

// Health check & API Overview
app.get('/', (req, res) => {
  res.json({
    app: 'SplitFlow API',
    status: 'online',
    database: 'MongoDB',
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET  /api/auth/me',
      'PUT  /api/auth/profile',
      'GET  /api/groups',
      'POST /api/groups',
      'POST /api/groups/join',
      'GET  /api/groups/:id/summary',
      'GET  /api/expenses/group/:groupId',
      'POST /api/expenses',
      'POST /api/expenses/intent',
      'GET  /api/settlements/balances',
      'POST /api/settlements',
      'POST /api/settlements/settle-all',
      'GET  /api/settlements/recent',
      'GET  /api/activities/group/:groupId',
      'POST /api/seed',
    ],
  });
});

const PRIMARY_PORT = process.env.PORT || 3000;
const SECONDARY_PORT = 5000;

app.listen(PRIMARY_PORT, '0.0.0.0', () => {
  console.log(`🚀 SplitFlow MongoDB Server running on port ${PRIMARY_PORT}`);
  console.log(`👉 Health check: http://localhost:${PRIMARY_PORT}/`);
});

if (String(PRIMARY_PORT) !== String(SECONDARY_PORT)) {
  try {
    const server2 = app.listen(SECONDARY_PORT, '0.0.0.0', () => {
      console.log(`🚀 SplitFlow MongoDB Server ALSO listening on secondary port ${SECONDARY_PORT}`);
      console.log(`👉 Secondary Health check: http://localhost:${SECONDARY_PORT}/`);
    });
    server2.on('error', (err) => {
      console.warn(`Secondary port ${SECONDARY_PORT} note:`, err.message);
    });
  } catch (err) {
    console.warn(`Could not bind secondary port ${SECONDARY_PORT}:`, err.message);
  }
}
