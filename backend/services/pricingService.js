/**
 * Local pricing estimator using eBay comparables
 * No external API calls - runs entirely locally
 */

const estimatePrice = async ({ image, condition, userDescription, ebayResults }) => {
  const comparables = ebayResults?.itemSummaries || [];

  if (!comparables || comparables.length === 0) {
    // No comparables - use conservative baseline estimate
    return {
      success: true,
      lowPrice: 15,
      highPrice: 50,
      suggestedPrice: 30,
      reasoning:
        "No comparable listings found on eBay. Estimate is based on general resale guidelines for used items. Adjust based on brand, condition, and demand.",
      comparablesCount: 0,
    };
  }

  // Extract prices from comparables
  const prices = comparables
    .filter((item) => item.price && item.price.value)
    .map((item) => parseFloat(item.price.value));

  if (prices.length === 0) {
    return {
      success: true,
      lowPrice: 15,
      highPrice: 50,
      suggestedPrice: 30,
      reasoning: "Comparable listings found but prices unavailable. Estimate based on general guidelines.",
      comparablesCount: comparables.length,
    };
  }

  // Calculate statistics
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const medianPrice = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)];

  // Condition adjustment multiplier
  let conditionMultiplier = 1.0;
  const normalizedCondition = (condition || "used").toLowerCase();
  if (normalizedCondition.includes("new")) {
    conditionMultiplier = 1.15; // New items get 15% premium
  } else if (normalizedCondition.includes("refurb") || normalizedCondition.includes("excellent")) {
    conditionMultiplier = 1.05; // Refurb/excellent get 5% premium
  } else if (normalizedCondition.includes("good")) {
    conditionMultiplier = 0.95; // Good condition gets slight discount
  } else if (normalizedCondition.includes("fair") || normalizedCondition.includes("poor")) {
    conditionMultiplier = 0.8; // Fair/poor gets 20% discount
  }

  // Estimate based on median and apply condition multiplier
  const basePrice = medianPrice;
  const adjustedMedian = basePrice * conditionMultiplier;

  // Set price range: conservative low, optimistic high
  let lowPrice = Math.max(
    5, // Minimum $5
    Math.round((minPrice * 0.8) * 100) / 100 // 80% of minimum
  );

  let highPrice = Math.round((maxPrice * 1.2) * 100) / 100; // 120% of maximum

  let suggestedPrice = Math.round(adjustedMedian * 100) / 100;

  // Ensure suggested is between low and high
  if (suggestedPrice < lowPrice) suggestedPrice = lowPrice;
  if (suggestedPrice > highPrice) suggestedPrice = highPrice;

  // Build reasoning
  const reasoningParts = [
    `Based on ${comparables.length} comparable eBay listing(s), prices range from $${minPrice.toFixed(2)} to $${maxPrice.toFixed(2)}.`,
    `Item condition is "${condition || "used"}"${conditionMultiplier !== 1.0 ? ` (${((conditionMultiplier - 1) * 100).toFixed(0)}% ${conditionMultiplier > 1 ? "premium" : "discount"})` : ""}.`,
    `Suggested selling price: $${suggestedPrice.toFixed(2)} (conservative: $${lowPrice.toFixed(2)}, optimistic: $${highPrice.toFixed(2)}).`,
  ];

  return {
    success: true,
    lowPrice,
    highPrice,
    suggestedPrice,
    reasoning: reasoningParts.join(" "),
    comparablesCount: comparables.length,
    priceRange: {
      min: minPrice,
      max: maxPrice,
      median: medianPrice,
      average: Math.round(avgPrice * 100) / 100,
    },
  };
};

module.exports = {
  estimatePrice,
};
