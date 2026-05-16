const bcrypt = require("bcryptjs");
const userRepository = require("../repositories/userRepository");

const registerUser = async (name, email, password) => {
  const existingUser = await userRepository.findUserByEmail(email);

  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userRepository.createUser({
    name,
    email,
    password: hashedPassword,
  });

  return {
  id: user._id,
  name: user.name,
  email: user.email,
};
};

module.exports = {
  registerUser,
};