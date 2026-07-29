const Item = require("../models/Item");
const PriceSuggestion = require("../models/PriceSuggestion");
const MarketPlace = require("../models/MarketPlace");

const buildBreakdown = (items, fieldName) => {
  return items.reduce((result, item) => {
    const value = item[fieldName]?.trim() || "Unknown";
    result[value] = (result[value] || 0) + 1;
    return result;
  }, {});
};


const DailyAnalyticsSnapshot = require(
  "../models/DailyAnalyticsSnapshot"
);

const {
  getDateKey,
  getPreviousDateKey,
} = require("./dailyAnalyticsSnapshotService");


const getItemPrice = (item) => {
  const price = Number(item.price);
  return Number.isFinite(price) ? price : 0;
};

const roundToTwoDecimals = (value) => {
  return Math.round(value * 100) / 100;
};

const getUserAnalytics = async (userId) => {
  const query = userId ? { owner: userId } : {};

  const items = await Item.find(query)
    .sort({ uploadDate: -1 })
    .lean();

  const itemIds = items.map((item) => item._id);

const totalEstimatedValue = items.reduce(
  (total, item) => total + getItemPrice(item),
  0
);

const todayKey = getDateKey();
const yesterdayKey = getPreviousDateKey(todayKey);

const snapshotOwner = userId || null;

const yesterdaySnapshot =
  await DailyAnalyticsSnapshot.findOne({
    owner: snapshotOwner,
    dateKey: yesterdayKey,
  }).lean();

let yesterdayTotalEstimatedValue = 0;
let valueChangedToday = 0;
let dailyPercentageIncrease = 0;

if (yesterdaySnapshot) {
  yesterdayTotalEstimatedValue = Number(
    yesterdaySnapshot.totalEstimatedValue
  );

  if (!Number.isFinite(yesterdayTotalEstimatedValue)) {
    yesterdayTotalEstimatedValue = 0;
  }

  valueChangedToday =
    totalEstimatedValue -
    yesterdayTotalEstimatedValue;

  if (yesterdayTotalEstimatedValue > 0) {
    dailyPercentageIncrease =
      (
        valueChangedToday /
        yesterdayTotalEstimatedValue
      ) * 100;
  }
}

/*
 * Save the latest total for today.
 * This becomes the historical baseline tomorrow.
 */
await DailyAnalyticsSnapshot.findOneAndUpdate(
  {
    owner: snapshotOwner,
    dateKey: todayKey,
  },
  {
    $set: {
      totalEstimatedValue:
        roundToTwoDecimals(totalEstimatedValue),
    },
  },
  {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  }
);
 
    const valueChangedToday =
    roundToTwoDecimals(valueChangedToday),

  // At the beginning of every day, valueAddedToday is 0,
  // so dailyPercentageIncrease is also 0.
  const dailyPercentageIncrease =
    roundToTwoDecimals(dailyPercentageIncrease),


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

  totalEstimatedValue:
    roundToTwoDecimals(totalEstimatedValue),

  valueAddedToday:
    roundToTwoDecimals(valueAddedToday),

  dailyPercentageIncrease:
    roundToTwoDecimals(dailyPercentageIncrease),

  averageSuggestedPrice:
    Math.round(averageSuggestedPrice * 100) / 100,

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

  const item = await Item.findById(itemId).lean();

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