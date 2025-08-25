const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const config = require("./shared/config");  
const authRoutes = require('./routes/authRoutes');

const app = express();

// Connect to MongoDB
mongoose.connect(config.dbUri)
  .then(() => console.log(`Auth Service connected to database: ${config.dbUri}`))
  .catch(err => console.error('Database connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    service: 'Auth Service',
    status: 'running',
    port: config.port,
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong!'
  });
});


const PORT = config.port || 4000;
app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});
