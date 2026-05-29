const express = require("express");
const router = express.Router();

const userRepository = require("../repositories/userRepository");
const protect = require("../middleware/authMiddleware");

// GET all users
router.get("/", protect, async (req, res, next) => {
  try {
    const users = await userRepository.getAllUsers();

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
});

// GET user by ID
router.get("/:id", async (req, res, next) => {
  try {
    const user = await userRepository.getUserById(req.params.id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
});

// UPDATE user
router.put("/:id", async (req, res, next) => {
  try {
    const user = await userRepository.updateUserById(req.params.id, req.body);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE user
router.delete("/:id", async (req, res, next) => {
  try {
    const user = await userRepository.deleteUserById(req.params.id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;