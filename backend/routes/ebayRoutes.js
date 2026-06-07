const express = require("express");
const router = express.Router();

const ebayService = require("../services/ebayService");

router.post("/listings", async (req, res, next) => {
  try {
    const { query, conditionId, limit } = req.body;

    if (!query) {
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
      price: item.price
        ? `${item.price.currency} ${item.price.value}`
        : "Price not available",
      imageUrl: item.image?.imageUrl || null,
      url: item.itemWebUrl,
      condition: item.condition,
    }));

    res.status(200).json({
      success: true,
      listings,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;