require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connection = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const clientRoutes = require('./routes/clientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const orderRoutes = require('./routes/orderRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const doctorAvailabilityRoutes = require('./routes/doctorAvailabilityRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/availability', doctorAvailabilityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/appointments', appointmentRoutes);

app.get('/', (req, res) => {
  res.send('MindBridge Backend API is running!');
});

// Example: Test DB Connection
app.get('/test-db', (req, res) => {
  connection.query('SELECT 1 + 1 AS solution', (error, results) => {
    if (error) {
      console.error('Error connecting to the database:', error);
      return res.status(500).send('Error connecting to the database');
    }
    res.send(`Database connection successful! 1 + 1 = ${results[0].solution}`);
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
}); 