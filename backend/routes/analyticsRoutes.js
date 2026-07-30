const express = require("express");
const router = express.Router();

const {
  getUserAnalytics,
  getItemMarketAnalytics,
} = require("../services/analyticsService");

router.get("/me", async (req, res, next) => {
  try {
    const userId = req.user?._id?.toString() || req.query.userId || null;
    const analytics = await getUserAnalytics(userId);

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/items/:itemId", async (req, res, next) => {
  try {
    const analytics = await getItemMarketAnalytics(req.params.itemId);

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
