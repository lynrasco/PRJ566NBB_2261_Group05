const Item = require("../models/Item");
const DailyAnalyticsSnapshot = require(
  "../models/DailyAnalyticsSnapshot"
);

const TIME_ZONE = "America/Toronto";

const roundToTwoDecimals = (value) => {
  return Math.round(value * 100) / 100;
};

const getDateKey = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const dateParts = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );

  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
};

const getPreviousDateKey = (dateKey) => {
  const [year, month, day] = dateKey.split("-").map(Number);

  const previousDate = new Date(
    Date.UTC(year, month - 1, day - 1)
  );

  return previousDate.toISOString().slice(0, 10);
};

const refreshDailySnapshot = async (userId = null) => {
  const itemQuery = userId
    ? { owner: userId }
    : {};

  const items = await Item.find(itemQuery)
    .select("price")
    .lean();

  const totalEstimatedValue = items.reduce(
    (total, item) => {
      const price = Number(item.price);

      return total + (
        Number.isFinite(price) ? price : 0
      );
    },
    0
  );

  const dateKey = getDateKey();

  return DailyAnalyticsSnapshot.findOneAndUpdate(
    {
      owner: userId || null,
      dateKey,
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
};

/*
 * Update the global snapshot and, when available,
 * the specific user's snapshot.
 */
const refreshDailySnapshots = async (ownerId = null) => {
  await refreshDailySnapshot(null);

  if (ownerId) {
    await refreshDailySnapshot(ownerId);
  }
};

module.exports = {
  getDateKey,
  getPreviousDateKey,
  refreshDailySnapshot,
  refreshDailySnapshots,
};