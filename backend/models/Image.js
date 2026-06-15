const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },

  uploadedAt: {
    type: Date,
    default: Date.now,
  },

  aiTags: [
    {
      type: String,
    },
  ],

  aiDescription: {
    type: String,
  },

  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
  },

  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Image", imageSchema);