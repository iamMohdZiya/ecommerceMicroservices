const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// Register a new user
const registerUser = async ({ name, email, password }) => {
  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error('User already exists');
  }

  // Generate salt and hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user with hashed password and salt
  const user = new User({
    name,
    email,
    password: hashedPassword,
    salt,
    role: 'user',
  });

  await user.save();

  // Generate JWT token
  const token = generateToken(user._id);

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
  };
};

// Authenticate user login
const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Compare password with hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  // Generate JWT token
  const token = generateToken(user._id);

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
  };
};

module.exports = {
  registerUser,
  loginUser,
  generateToken,
};