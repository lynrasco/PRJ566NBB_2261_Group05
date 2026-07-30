const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getUserAnalytics,
  getItemMarketAnalytics,
} = require("../services/analyticsService");

router.get("/me", protect, async (req, res, next) => {
  try {
    const userId = req.user?._id?.toString();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication is required",
      });
    }

    const analytics = await getUserAnalytics(userId);

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/items/:itemId", protect, async (req, res, next) => {
  try {
    const analytics = await getItemMarketAnalytics(
      req.params.itemId
    );

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;