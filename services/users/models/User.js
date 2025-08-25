const mongoose = require('mongoose');
const { createHmac , randomBytes } = require('crypto');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
}, {
  timestamps: true,
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  const salt = randomBytes(16).toString('hex');
  this.salt = salt;
  this.password = createHmac('sha256', salt)
    .update(this.password)
    .digest('hex');
  next(); 
});

module.exports = mongoose.model('User', userSchema);
