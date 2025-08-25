// Reusable validation functions for user inputs

// Validate email format using regex
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate password strength
// At least 6 characters, at least one number, one uppercase letter, one lowercase letter
const isStrongPassword = (password) => {
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return re.test(password);
};

module.exports = {
  isValidEmail,
  isStrongPassword,
};