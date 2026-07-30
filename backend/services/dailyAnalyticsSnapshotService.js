const DailyAnalyticsSnapshot = require(
  "../models/DailyAnalyticsSnapshot"
);
const itemRepository = require("../repositories/itemRepository");

const ANALYTICS_TIME_ZONE = "America/Toronto";

const getDateKey = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ANALYTICS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );

  return `${values.year}-${values.month}-${values.day}`;
};

const calculateCurrentTotal = async (userId) => {
  const items = await itemRepository.getItemsByUserId(userId);

  return items.reduce((total, item) => {
    const price = Number(item.price);

    return total + (Number.isFinite(price) ? price : 0);
  }, 0);
};

const getOrCreateDailySnapshot = async (userId) => {
  if (!userId) {
    const error = new Error(
      "User ID is required for the daily analytics snapshot"
    );
    error.statusCode = 401;
    throw error;
  }

  const dateKey = getDateKey();

  const existingSnapshot =
    await DailyAnalyticsSnapshot.findOne({
      owner: userId,
      dateKey,
    }).lean();

  if (existingSnapshot) {
    return existingSnapshot;
  }

  const openingTotal = await calculateCurrentTotal(userId);

  return DailyAnalyticsSnapshot.findOneAndUpdate(
    {
      owner: userId,
      dateKey,
    },
    {
      $setOnInsert: {
        owner: userId,
        dateKey,
        openingTotal,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  ).lean();
};

module.exports = {
  getDateKey,
  getOrCreateDailySnapshot,
};