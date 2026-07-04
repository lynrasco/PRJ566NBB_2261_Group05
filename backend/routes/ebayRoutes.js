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

router.post("/", handleListingsSearch);
router.post("/listings", handleListingsSearch);

module.exports = router;