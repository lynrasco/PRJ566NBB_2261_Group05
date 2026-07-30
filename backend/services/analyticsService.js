const itemRepository = require("../repositories/itemRepository");
const PriceSuggestion = require("../models/PriceSuggestion");
const MarketPlace = require("../models/MarketPlace");

const buildBreakdown = (items, fieldName) => {
  return items.reduce((result, item) => {
    const value = item[fieldName]?.trim() || "Unknown";
    result[value] = (result[value] || 0) + 1;
    return result;
  }, {});
};

const {
  getOrCreateDailySnapshot,
} = require("./dailyAnalyticsSnapshotService");

const getItemPrice = (item) => {
  const price = Number(item.price);
  return Number.isFinite(price) ? price : 0;
};

const roundToTwoDecimals = (value) => {
  return Math.round(value * 100) / 100;
};

const getUserAnalytics = async (userId) => {
  if (!userId) {
    const error = new Error("User ID is required for analytics");
    error.statusCode = 401;
    throw error;
  }

  const dailySnapshot = await getOrCreateDailySnapshot(userId);
  const items = await itemRepository.getItemsByUserId(userId);

  const itemIds = items.map((item) => item._id);

  const totalEstimatedValue = items.reduce(
    (total, item) => total + getItemPrice(item),
    0
  );

  const openingTotal =
    Number(dailySnapshot.openingTotal) || 0;

  const valueAddedToday =
    totalEstimatedValue - openingTotal;

  let dailyPercentageIncrease = 0;

  if (openingTotal > 0) {
    dailyPercentageIncrease =
      (valueAddedToday / openingTotal) * 100;
  } else if (totalEstimatedValue > 0) {
    dailyPercentageIncrease = 100;
  }

  if (itemIds.length === 0) {
    return {
      totalSavedItems: 0,
      totalEstimatedValue: 0,
      valueAddedToday: 0,
      dailyPercentageIncrease: 0,
      averageSuggestedPrice: 0,
      marketplaceComparables: 0,
      categoryBreakdown: {},
      conditionBreakdown: {},
      recentItems: [],
    };
  }

  const [suggestions, marketplaceComparables] = await Promise.all([
    PriceSuggestion.find({
      item: { $in: itemIds },
    }).lean(),

    MarketPlace.countDocuments({
      item: { $in: itemIds },
    }),
  ]);

  const suggestedPrices = suggestions
    .map((suggestion) => Number(suggestion.suggestedPrice))
    .filter(Number.isFinite);

  const totalSuggestedPrice = suggestedPrices.reduce(
    (sum, price) => sum + price,
    0
  );

  const averageSuggestedPrice =
    suggestedPrices.length > 0
      ? totalSuggestedPrice / suggestedPrices.length
      : 0;

  const recentItems = items.slice(0, 5).map((item) => ({
    id: item._id,
    title: item.title,
    category: item.category,
    condition: item.condition,
    imageUrl: item.imageUrl,
    uploadDate: item.uploadDate,
  }));

  return {
    totalSavedItems: items.length,
    totalEstimatedValue: roundToTwoDecimals(totalEstimatedValue),
    valueAddedToday: roundToTwoDecimals(valueAddedToday),
    dailyPercentageIncrease: roundToTwoDecimals(
      dailyPercentageIncrease
    ),
    averageSuggestedPrice: roundToTwoDecimals(
      averageSuggestedPrice
    ),
    marketplaceComparables,
    categoryBreakdown: buildBreakdown(items, "category"),
    conditionBreakdown: buildBreakdown(items, "condition"),
    recentItems,
  };
};

const getItemMarketAnalytics = async (itemId) => {
  if (!itemId) {
    const error = new Error("Item ID is required");
    error.statusCode = 400;
    throw error;
  }

  const item = await itemRepository.getItemById(itemId);

  if (!item) {
    const error = new Error("Item not found");
    error.statusCode = 404;
    throw error;
  }

  const listings = await MarketPlace.find({
    item: itemId,
  }).lean();

  const prices = listings
    .map((listing) => Number(listing.price))
    .filter(Number.isFinite);

  if (prices.length === 0) {
    return {
      itemId,
      itemTitle: item.title,
      comparablesCount: 0,
      averageMarketPrice: 0,
      lowestMarketPrice: 0,
      highestMarketPrice: 0,
      sellingRate: null,
      marketTrend: "Insufficient marketplace data",
    };
  }

  const totalMarketPrice = prices.reduce(
    (sum, price) => sum + price,
    0
  );

  const averageMarketPrice =
    totalMarketPrice / prices.length;

  return {
    itemId,
    itemTitle: item.title,
    comparablesCount: listings.length,
    averageMarketPrice:
      Math.round(averageMarketPrice * 100) / 100,
    lowestMarketPrice: Math.min(...prices),
    highestMarketPrice: Math.max(...prices),
    sellingRate: null,
    marketTrend: "Selling-rate data is not available yet",
  };
};

module.exports = {
  getUserAnalytics,
  getItemMarketAnalytics,
};