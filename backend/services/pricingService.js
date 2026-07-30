/**
 * Local pricing estimator using eBay comparables.
 * Runs locally without additional external API calls.
 */

const roundToTwoDecimals = (value) => {
  return Math.round(value * 100) / 100;
};

const getPercentile = (sortedValues, percentile) => {
  if (sortedValues.length === 0) {
    return 0;
  }

  if (sortedValues.length === 1) {
    return sortedValues[0];
  }

  const index = (sortedValues.length - 1) * percentile;
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);

  if (lowerIndex === upperIndex) {
    return sortedValues[lowerIndex];
  }

  const weight = index - lowerIndex;

  return (
    sortedValues[lowerIndex] * (1 - weight) +
    sortedValues[upperIndex] * weight
  );
};

const getConditionMultiplier = (condition) => {
  const normalizedCondition = String(
    condition || "used"
  ).toLowerCase();

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

  if (normalizedCondition.includes("poor")) {
    return 0.6;
  }

  return 0.9;
};

const removeOutliers = (sortedPrices) => {
  if (sortedPrices.length < 4) {
    return sortedPrices;
  }

  const firstQuartile = getPercentile(
    sortedPrices,
    0.25
  );

  const thirdQuartile = getPercentile(
    sortedPrices,
    0.75
  );

  const interquartileRange =
    thirdQuartile - firstQuartile;

  const minimumAllowed =
    firstQuartile - 1.5 * interquartileRange;

  const maximumAllowed =
    thirdQuartile + 1.5 * interquartileRange;

  const filteredPrices = sortedPrices.filter(
    (price) =>
      price >= minimumAllowed &&
      price <= maximumAllowed
  );

  return filteredPrices.length >= 3
    ? filteredPrices
    : sortedPrices;
};

const calculateConfidence = (
  cleanedPrices,
  totalComparables
) => {
  if (cleanedPrices.length === 0) {
    return 0;
  }

  const median = getPercentile(cleanedPrices, 0.5);
  const firstQuartile = getPercentile(
    cleanedPrices,
    0.25
  );
  const thirdQuartile = getPercentile(
    cleanedPrices,
    0.75
  );

  const priceSpread =
    thirdQuartile - firstQuartile;

  const relativeSpread =
    median > 0 ? priceSpread / median : 1;

  // More comparable listings increase confidence.
  const comparableScore = Math.min(
    55,
    cleanedPrices.length * 7
  );

  // Similar prices increase confidence.
  const consistencyScore = Math.max(
    0,
    35 - relativeSpread * 35
  );

  // Fewer removed outliers increase confidence.
  const retentionScore =
    totalComparables > 0
      ? (cleanedPrices.length / totalComparables) * 10
      : 0;

  return Math.round(
    Math.min(
      95,
      comparableScore +
        consistencyScore +
        retentionScore
    )
  );
};

const estimatePrice = async ({
  condition,
  ebayResults,
}) => {
  const comparables =
    ebayResults?.itemSummaries || [];

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
        "No usable comparable prices were found. Estimate uses conservative general resale guidelines.",
      comparablesCount: 0,
      usedComparablesCount: 0,
    };
  }

  const cleanedPrices = removeOutliers(prices);
  const conditionMultiplier =
    getConditionMultiplier(condition);

  /*
   * Use conservative percentiles instead of:
   * - absolute minimum
   * - median
   * - absolute maximum
   *
   * This prevents one expensive listing from
   * making the estimate unrealistically high.
   */
  let lowPrice =
    getPercentile(cleanedPrices, 0.2) *
    conditionMultiplier;

  let suggestedPrice =
    getPercentile(cleanedPrices, 0.4) *
    conditionMultiplier;

  let highPrice =
    getPercentile(cleanedPrices, 0.7) *
    conditionMultiplier;

  lowPrice = Math.max(
    5,
    roundToTwoDecimals(lowPrice)
  );

  suggestedPrice = Math.max(
    lowPrice,
    roundToTwoDecimals(suggestedPrice)
  );

  highPrice = Math.max(
    suggestedPrice,
    roundToTwoDecimals(highPrice)
  );

  const removedOutlierCount =
    prices.length - cleanedPrices.length;

    const confidence = calculateConfidence(
      cleanedPrices,
      prices.length
    );

  return {
    success: true,
    lowPrice,
    highPrice,
    suggestedPrice,
    confidence,
    reasoning: [
      `Calculated from ${cleanedPrices.length} usable comparable listing(s).`,
      removedOutlierCount > 0
        ? `${removedOutlierCount} unusually priced listing(s) were excluded.`
        : "No significant price outliers were detected.",
      `The estimate was adjusted for "${condition || "used"}" condition.`,
      `Suggested resale price: $${suggestedPrice.toFixed(2)}.`,
    ].join(" "),
    comparablesCount: comparables.length,
    usedComparablesCount: cleanedPrices.length,
    priceRange: {
      minimumComparable: roundToTwoDecimals(
        Math.min(...cleanedPrices)
      ),
      maximumComparable: roundToTwoDecimals(
        Math.max(...cleanedPrices)
      ),
      medianComparable: roundToTwoDecimals(
        getPercentile(cleanedPrices, 0.5)
      ),
    },
  };
};

module.exports = {
  estimatePrice,
};