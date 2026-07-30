/**
 * Local pricing estimator using eBay comparables.
 * No additional external API calls.
 */

const roundToTwoDecimals = (value) => {
  return Math.round(value * 100) / 100;
};

const getMedian = (sortedPrices) => {
  const middleIndex = Math.floor(sortedPrices.length / 2);

  // Odd number of prices
  if (sortedPrices.length % 2 !== 0) {
    return sortedPrices[middleIndex];
  }

  // Even number of prices: average the two middle values
  return (
    sortedPrices[middleIndex - 1] +
    sortedPrices[middleIndex]
  ) / 2;
};

const getConditionMultiplier = (condition) => {
  const normalizedCondition = String(
    condition || "used"
  )
    .trim()
    .toLowerCase();

  // Best condition
  if (normalizedCondition.includes("new")) {
    return 1;
  }

  if (
    normalizedCondition.includes("excellent") ||
    normalizedCondition.includes("refurb")
  ) {
    return 0.95;
  }

  if (
    normalizedCondition.includes("good") ||
    normalizedCondition.includes("used") ||
    normalizedCondition.includes("pre-owned")
  ) {
    return 0.9;
  }

  if (normalizedCondition.includes("fair")) {
    return 0.75;
  }

  // Worst condition
  if (normalizedCondition.includes("poor")) {
    return 0.6;
  }

  // Default when condition is missing or unrecognized
  return 0.9;
};

const estimatePrice = async ({
  condition,
  ebayResults,
}) => {
  const comparables =
    ebayResults?.itemSummaries || [];

  if (comparables.length === 0) {
    return {
      success: true,
      lowPrice: 15,
      highPrice: 50,
      suggestedPrice: 30,
      reasoning:
        "No comparable listings were found. A conservative fallback estimate was used.",
      comparablesCount: 0,
      usedComparablesCount: 0,
    };
  }

  // Extract only valid positive prices
  const prices = comparables
    .map((item) => Number(item.price?.value))
    .filter(
      (price) =>
        Number.isFinite(price) &&
        price > 0
    )
    .sort((a, b) => a - b);

  if (prices.length === 0) {
    return {
      success: true,
      lowPrice: 15,
      highPrice: 50,
      suggestedPrice: 30,
      reasoning:
        "Comparable listings were found, but their prices were unavailable. A conservative fallback estimate was used.",
      comparablesCount: comparables.length,
      usedComparablesCount: 0,
    };
  }

  /*
   * Pricing rules:
   *
   * Low:
   * Lowest comparable price × worst condition multiplier
   *
   * High:
   * Highest comparable price × best condition multiplier
   *
   * Suggested:
   * Median comparable price × selected condition multiplier
   */

  const WORST_CONDITION_MULTIPLIER = 0.6;
  const BEST_CONDITION_MULTIPLIER = 1;

  const minimumComparable = Math.min(...prices);
  const maximumComparable = Math.max(...prices);
  const medianComparable = getMedian(prices);

  const conditionMultiplier =
    getConditionMultiplier(condition);

  let lowPrice =
    minimumComparable *
    WORST_CONDITION_MULTIPLIER;

  let highPrice =
    maximumComparable *
    BEST_CONDITION_MULTIPLIER;

  let suggestedPrice =
    medianComparable *
    conditionMultiplier;

  lowPrice = roundToTwoDecimals(lowPrice);
  highPrice = roundToTwoDecimals(highPrice);
  suggestedPrice =
    roundToTwoDecimals(suggestedPrice);

  // Keep the suggested value inside the displayed range
  suggestedPrice = Math.min(
    highPrice,
    Math.max(lowPrice, suggestedPrice)
  );

  const averagePrice =
    prices.reduce(
      (total, price) => total + price,
      0
    ) / prices.length;

  const conditionPercentage = Math.round(
    conditionMultiplier * 100
  );

  return {
    success: true,
    lowPrice,
    highPrice,
    suggestedPrice,

    reasoning: [
      `Calculated from ${prices.length} usable eBay comparable listing(s).`,
      `The lowest comparable was $${minimumComparable.toFixed(
        2
      )} and was adjusted to the worst condition at 60%.`,
      `The highest comparable was $${maximumComparable.toFixed(
        2
      )} and was adjusted to the best condition at 100%.`,
      `The suggested price used the median comparable of $${medianComparable.toFixed(
        2
      )} and the selected "${condition || "used"}" condition multiplier of ${conditionPercentage}%.`,
      `Suggested resale price: $${suggestedPrice.toFixed(
        2
      )}.`,
    ].join(" "),

    comparablesCount: comparables.length,
    usedComparablesCount: prices.length,

    conditionMultiplier,

    priceRange: {
      minimumComparable:
        roundToTwoDecimals(
          minimumComparable
        ),
      maximumComparable:
        roundToTwoDecimals(
          maximumComparable
        ),
      medianComparable:
        roundToTwoDecimals(
          medianComparable
        ),
      averageComparable:
        roundToTwoDecimals(
          averagePrice
        ),
    },
  };
};

module.exports = {
  estimatePrice,
};