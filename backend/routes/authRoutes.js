const express = require("express");
const router = express.Router();

const { registerUser, loginUser} = require("../services/authService");

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

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await loginUser(email, password);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;