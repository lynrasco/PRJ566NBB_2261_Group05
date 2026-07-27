const express = require("express");
const router = express.Router();

const userRepository = require("../repositories/userRepository");
const protect = require("../middleware/authMiddleware");

const {
  sendPushNotification,
} = require("../services/notificationService");

router.post("/:id/notifications/test", async (req, res, next) => {
  try {
    const user = await userRepository.getUserById(req.params.id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    if (!user.notificationSettings?.pushEnabled) {
      const error = new Error("Push notifications are disabled");
      error.statusCode = 400;
      throw error;
    }

    const result = await sendPushNotification({
      expoPushToken: user.expoPushToken,
      title: "FlipValue",
      body: "Push notifications are working!",
      data: {
        type: "test",
      },
    });

    res.status(200).json({
      success: true,
      message: "Test notification sent",
      result,
    });
  } catch (error) {
    next(error);
  }
});

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


// GET notification settings
router.get("/:id/notifications", async (req, res, next) => {
  try {
    const user = await userRepository.getUserById(req.params.id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      expoPushToken: user.expoPushToken,
      notificationSettings: user.notificationSettings,
    });
  } catch (error) {
    next(error);
  }
});


// UPDATE notification settings and push token
router.put("/:id/notifications", async (req, res, next) => {
  try {
    const {
      expoPushToken,
      pushEnabled,
      priceAlerts,
      marketUpdates,
      securityAlerts,
    } = req.body;

    const updateData = {
      notificationSettings: {
        pushEnabled: Boolean(pushEnabled),
        priceAlerts: Boolean(priceAlerts),
        marketUpdates: Boolean(marketUpdates),
        securityAlerts: Boolean(securityAlerts),
      },
    };

    if (expoPushToken !== undefined) {
      updateData.expoPushToken = expoPushToken;
    }

    const user = await userRepository.updateUserById(
      req.params.id,
      updateData
    );

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      notificationSettings: user.notificationSettings,
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