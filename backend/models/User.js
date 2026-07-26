const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    expoPushToken: {
      type: String,
      default: null,
      trim: true,
    },

    notificationSettings: {
      pushEnabled: {
        type: Boolean,
        default: true,
      },

      priceAlerts: {
        type: Boolean,
        default: true,
      },

      marketUpdates: {
        type: Boolean,
        default: false,
      },

      securityAlerts: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);