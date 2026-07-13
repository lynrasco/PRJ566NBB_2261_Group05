const express = require("express");
const router = express.Router();

const ebayService = require("../services/ebayService");

const handleListingsSearch = async (req, res, next) => {
  try {
    const { query, conditionId, limit } = req.body;

    if (!query || !query.trim()) {
      const error = new Error("Search query is required");
      error.statusCode = 400;
      throw error;
    }

    const ebayResult = await ebayService.searchItems(
      query,
      conditionId || null,
      limit || 12
    );

    const listings = (ebayResult.itemSummaries || []).map((item) => ({
      id: item.itemId,
      marketplace: "eBay",
      title: item.title,
      price: item.price ? Number(item.price.value) : null,
      currency: item.price?.currency || "USD",
      imageUrl: item.image?.imageUrl || null,
      url: item.itemWebUrl,
      condition: item.condition || null,
    }));

    res.status(200).json({
      success: true,
      listings,
    });
  } catch (error) {
    next(error);
  }
};

const handleCreateListing = async (req, res, next) => {
  try {
    const item = req.body;

    if (!item || !item.title) {
      const error = new Error("Listing item information is required");
      error.statusCode = 400;
      throw error;
    }

    const result = await ebayService.createListing(item);

    res.status(201).json({
      success: true,
      message: "Listing request sent to eBay",
      result,
    });
  } catch (error) {
    const statusCode = error?.statusCode || 500;
    console.error("Failed to create eBay listing:", {
      message: error?.message,
      stage: error?.stage,
      ebayStatus: error?.ebayStatus,
      details: JSON.stringify(error?.details, null, 2),
    });

    res.status(statusCode).json({
      success: false,
      message: error?.message || "Failed to create eBay listing",
      stage: error?.stage,
      ebayStatus: error?.ebayStatus,
      details: error?.details,
    });
  }
};

const handleSellerPolicies = async (req, res) => {
  try {
    const result = await ebayService.getSellerPolicies();

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    const statusCode = error?.statusCode || 500;
    console.error("Failed to fetch eBay seller policies:", {
      message: error?.message,
      stage: error?.stage,
      ebayStatus: error?.ebayStatus,
      details: error?.details,
    });

    res.status(statusCode).json({
      success: false,
      message: error?.message || "Failed to fetch eBay seller policies",
      stage: error?.stage,
      ebayStatus: error?.ebayStatus,
      details: error?.details,
    });
  }
};

router.post("/", handleListingsSearch);
router.get("/seller-policies", handleSellerPolicies);
router.post("/listings", handleCreateListing);

module.exports = router;
