const mongoose = require("mongoose");

const priceSuggestionSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    lowPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    highPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    suggestedPrice: {
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

    condition: {
      type: String,
      trim: true,
    },

    reasoning: {
      type: String,
      trim: true,
    },

    comparablesCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    priceRange: {
      min: {
        type: Number,
        min: 0,
      },

      max: {
        type: Number,
        min: 0,
      },

      median: {
        type: Number,
        min: 0,
      },

      average: {
        type: Number,
        min: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PriceSuggestion", priceSuggestionSchema);