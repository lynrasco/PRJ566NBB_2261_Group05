const mongoose = require("mongoose");

const marketPlaceSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    externalId: {
      type: String,
      required: true,
      trim: true,
    },

    marketplace: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "USD",
      trim: true,
      uppercase: true,
    },

    imageUrl: {
      type: String,
      default: null,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    condition: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MarketPlace", marketPlaceSchema);