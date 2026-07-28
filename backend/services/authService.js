const bcrypt = require("bcryptjs");
const userRepository = require("../repositories/userRepository");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { createSuccessResponse, createErrorResponse } = require("../response");


const registerUser = async (name, email, password) => {
  const existingUser = await userRepository.findUserByEmail(email);

  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const first = name.toLowerCase().split(' ')[0];
  const last = "fl";
  const userName = first +  last + Math.floor(Math.random() * (100 + 1));
  console.log(userName);
  const user = await userRepository.createUser({
    name,
    email,
    userName,
    password: hashedPassword,
  });

  return {
  id: user._id,
  name: user.name,
  email: user.email,
  userName: userName,
};
};

const loginUser = async (email, password) => {
if (!email || !password) {


    const error = new Error("Email and password required");
    error.statusCode = 400;
    throw error;

    }

    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    console.log("login handler found user:", user.password);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {

      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    console.log("login handler JWT_SECRET present:", !!process.env.JWT_SECRET);
    console.log(
      "login handler JWT_SECRET length:",
      process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
    );
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );
    console.log("login handler generated token:", token);
    console.log("LOGIN USER OBJECT:", user);
    console.log("USERNAME:", user.userName);

    return createSuccessResponse({
        message: "Login successful",
        token,
        user: { id: user._id, email: user.email, name: user.name, userName: user.userName },
      });
  

    
};




module.exports = {
  registerUser,loginUser
};