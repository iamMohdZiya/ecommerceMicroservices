


// const registerUser = asyncHandler(async (req, res) => {
//   const { name, email, password } = req.body;

//   try {
//     const userData = await authService.registerUser({ name, email, password });
//     res.status(201).json(userData);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// const loginUser = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const userData = await authService.loginUser({ email, password });
//     res.json(userData);
//   } catch (error) {
//     res.status(401).json({ message: error.message });
//   }
// }); 

// module.exports = {
//   registerUser,
//   loginUser,
// };


const User = require('../models/User');
const AuthClient = require('../shared/authClient');
const config = require('../shared/config');

exports.handleSignUp = async (req, res) => {
  const { name, email, password } = req.body;
  
  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }
  
  // Password strength validation
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    
    const user = new User({ name, email, password });
    await user.save();
    
    res.status(201).json({ 
      message: 'Account created successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    if (error.code === 11000) {
      // MongoDB duplicate key error
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    
    res.status(500).json({ message: 'Error creating account. Please try again.' });
  }
};

exports.handleSignIn = async (req, res) => {
  const { email, password } = req.body;
  
  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  try {
    // First validate the user credentials
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const userProvidedHash = require('crypto').createHmac('sha256', user.salt)
      .update(password)
      .digest('hex');

    if (user.password !== userProvidedHash) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token using auth service
    const authClient = new AuthClient({
      authServiceUrl: config.authServiceUrl,
      serviceToken: config.usersServiceToken
    });
    const token = await authClient.generateToken({
      _id: user._id,
      email: user.email,
      role: user.role
    });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000 // 1 hour
    }).status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login. Please try again.' });
  }
};