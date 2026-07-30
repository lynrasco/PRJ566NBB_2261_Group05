const express = require("express");
const router = express.Router();

const ebayService = require("../services/ebayService");
const pricingService = require("../services/pricingService");
const imageRepository = require("../repositories/imageRepository");

const Item = require("../models/Item");
const PriceSuggestion = require("../models/PriceSuggestion");

const normalizeEbayCondition = (condition) => {
  if (!condition) return null;

  const normalized = condition.toString().trim().toLowerCase();

  if (normalized.includes("new")) return 1000;
  if (normalized.includes("open")) return 1500;
  if (normalized.includes("refurb")) return 2000;
  if (normalized.includes("used")) return 3000;

  return null;
};

const buildSearchQuery = ({ image, userDescription }) => {
  const parts = [];

  if (image?.aiTags?.length) {
    parts.push(...image.aiTags.slice(0, 3));
  }

  if (userDescription) {
    parts.push(userDescription);
  }

  return parts.join(" ").replace(/\s+/g, " ").trim();
};

const createPriceEstimate = async (req, res, next) => {
  try {
    const {
      itemId,
      imageId,
      condition,
      userDescription,
      query: providedQuery,
    } = req.body;

    let image = null;

    if (imageId) {
      image = await imageRepository.getImageById(imageId);

      if (!image) {
        const error = new Error("Image not found");
        error.statusCode = 404;
        throw error;
      }
    }

    const query =
      providedQuery ||
      buildSearchQuery({
        image,
        userDescription,
      });

    if (!query) {
      const error = new Error(
        "A query, image ID, or user description is required"
      );
      error.statusCode = 400;
      throw error;
    }

    const conditionId = normalizeEbayCondition(condition);

    const ebayResults = await ebayService.searchItems(
      query,
      conditionId,
      12
    );

    const priceEstimate = await pricingService.estimatePrice({
      image,
      condition: condition || "used",
      userDescription,
      ebayResults,
    });

    if (!itemId) {
      const error = new Error("Item ID is required to save the price suggestion");
      error.statusCode = 400;
      throw error;
    }

    const item = await Item.findById(itemId);

    if (!item) {
      const error = new Error("Item not found");
      error.statusCode = 404;
      throw error;
    }

    const savedSuggestion = await PriceSuggestion.findOneAndUpdate(
      { item: itemId },
      {
        item: itemId,
        lowPrice: priceEstimate.lowPrice,
        highPrice: priceEstimate.highPrice,
        suggestedPrice: priceEstimate.suggestedPrice,
        currency:
          ebayResults?.itemSummaries?.[0]?.price?.currency || "USD",
        condition: condition || item.condition || "used",
        reasoning: priceEstimate.reasoning,
        comparablesCount: priceEstimate.comparablesCount,
        priceRange: priceEstimate.priceRange || undefined,
      },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    // Also update the item's current estimated value
    await Item.findByIdAndUpdate(itemId, {
      price: priceEstimate.suggestedPrice,
    });

    res.status(200).json({
      success: true,
      message: "Price estimate completed successfully",
      query,
      conditionId,
      priceEstimate,
      priceSuggestion: savedSuggestion,
    });
  } catch (error) {
    next(error);
  }
};

router.post("/", createPriceEstimate);
router.post("/estimate", createPriceEstimate);

module.exports = router;