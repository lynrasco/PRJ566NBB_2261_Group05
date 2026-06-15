const User = require("../models/User");

const createUser = async (userData) => {
  return await User.create(userData);
};

const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

const getAllUsers = async () => {
  return await User.find().select("-password");
};

const getUserById = async (id) => {
  return await User.findById(id).select("-password");
};

const updateUserById = async (id, userData) => {
  return await User.findByIdAndUpdate(id, userData, {
    new: true,
    runValidators: true,
  }).select("-password");
};

const deleteUserById = async (id) => {
  return await User.findByIdAndDelete(id);
};

module.exports = {
  createUser,
  findUserByEmail,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
};