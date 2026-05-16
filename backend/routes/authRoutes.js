const express = require("express");
const router = express.Router();

const { registerUser } = require("../services/authService");

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const user = await registerUser(name, email, password);

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;