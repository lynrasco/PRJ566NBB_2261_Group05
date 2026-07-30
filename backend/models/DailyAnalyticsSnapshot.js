const mongoose = require("mongoose");

const dailyAnalyticsSnapshotSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dateKey: {
      type: String,
      required: true,
    },
    openingTotal: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

dailyAnalyticsSnapshotSchema.index(
  {
    owner: 1,
    dateKey: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "DailyAnalyticsSnapshot",
  dailyAnalyticsSnapshotSchema
);