const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const error = new Error("Server configuration error: JWT_SECRET is missing");
    error.statusCode = 500;
    throw error;
  }
  return secret;
};

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      const error = new Error("Not authorized, no token provided");
      error.statusCode = 401;
      throw error;
    }

    const decoded = jwt.verify(token, getJwtSecret());

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      const error = new Error("Not authorized, user not found");
      error.statusCode = 401;
      throw error;
    }

    next();
  } catch (error) {
    error.statusCode = error.statusCode || 401;
    next(error);
  }
};

module.exports = protect;