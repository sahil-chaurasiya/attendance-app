const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');
const cronJobs = require('./services/cronJobs');

dotenv.config();
console.log('🔧 MONGODB_URI:', process.env.MONGODB_URI);
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',             require('./routes/auth'));
app.use('/api/attendance',       require('./routes/attendance'));
app.use('/api/admin',            require('./routes/admin'));
app.use('/api/users',            require('./routes/users'));
app.use('/api/cron',             require('./routes/cron'));
app.use('/api/wfh',              require('./routes/wfh'));
app.use('/api/leave',            require('./routes/leave'));
app.use('/api/regularization',   require('./routes/regularization')); // ← Attendance Regularization
app.use('/api/notifications',    require('./routes/notifications'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

// Start cron jobs
cronJobs.start();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;
