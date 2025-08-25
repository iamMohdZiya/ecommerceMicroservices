
const config = require('./shared/config');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const app = express();

mongoose.connect(config.dbUri)
  .then(() => console.log(`Connected to database: ${config.dbUri}`))
  .catch(err => console.error('Database connection error:', err));



// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/api/auth', (req, res) => {
  res.send('yooo API is running...');
});
app.get('/api/yoo', (req, res) => {
  res.send('API is running...');
});

app.use(errorHandler);



app.listen(config.port, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${config.port}`);
});