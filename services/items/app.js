const express = require("express");
const config = require("./shared/config");  
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const { AuthService } = require("./shared/authService");
const itemRoutes = require("./routes/itemRoutes");
const errorHandler = require("./middlewares/errors");

const authService = new AuthService();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(config.dbUri)
  .then(() => console.log(`Connected to database: ${config.dbUri}`))
  .catch(err => console.error('Database connection error:', err));

// Routes
app.use("/api", itemRoutes);

// Error handler
app.use(errorHandler);


const PORT = 4002;
app.listen(PORT, () => {
  console.log(`Items Service running on port ${PORT}`);
});
