/**
 * Test script for Local Pricing Service
 * Run: node testLocalPricing.js
 */

const localPricingService = require('./services/localPricingService');

// Mock eBay results (9 Nike shoes with realistic prices)
const mockEbayResults = {
  itemSummaries: [
    { title: "Nike Air Force 1", price: { value: "167.69" }, condition: "Pre-owned - Good" },
    { title: "Nike Dunk High", price: { value: "176.08" }, condition: "Pre-owned - Good" },
    { title: "Nike Court Borough", price: { value: "89.99" }, condition: "Pre-owned - Fair" },
    { title: "Nike Air Max 90", price: { value: "234.50" }, condition: "Pre-owned - Excellent" },
    { title: "Nike React Infinity", price: { value: "145.00" }, condition: "Pre-owned - Good" },
    { title: "Nike Revolution 6", price: { value: "65.00" }, condition: "Pre-owned - Good" },
    { title: "Nike Air Zoom Pegasus", price: { value: "125.75" }, condition: "Pre-owned - Good" },
    { title: "Nike SB Dunk Low", price: { value: "393.71" }, condition: "Pre-owned - Good" },
    { title: "Nike Court Legacy", price: { value: "87.50" }, condition: "Pre-owned - Fair" },
  ],
};

// Mock image
const mockImage = {
  _id: "6a14d6ee694c0805d8726f8c",
  aiTags: ["Nike", "Shoe", "Athletic"],
  aiDescription: "Nike brand athletic shoe",
  imageUrl: "uploads/image.jpg",
};

// Test function
async function testLocalPricing() {
  console.log("🧪 Testing Local Pricing Service...\n");
  console.log("📊 Mock Data:");
  console.log(`   - Image ID: ${mockImage._id}`);
  console.log(`   - Condition: used`);
  console.log(`   - eBay Comparables: ${mockEbayResults.itemSummaries.length} items`);
  
  const prices = mockEbayResults.itemSummaries.map(i => parseFloat(i.price.value));
  console.log(`   - Price Range: $${Math.min(...prices)} - $${Math.max(...prices)}`);
  console.log(`   - Average: $${(prices.reduce((a,b) => a+b) / prices.length).toFixed(2)}\n`);

  try {
    console.log("⏳ Calculating prices locally (no API calls)...\n");
    
    const result = await localPricingService.estimatePrice({
      image: mockImage,
      condition: "used",
      userDescription: "Nike shoes, lightly worn",
      ebayResults: mockEbayResults,
    });

    console.log("✅ Local Pricing Result:\n");
    console.log(JSON.stringify(result, null, 2));
    
    console.log("\n📈 Summary:");
    console.log(`   - Conservative (Low): $${result.lowPrice}`);
    console.log(`   - Suggested: $${result.suggestedPrice}`);
    console.log(`   - Optimistic (High): $${result.highPrice}`);
    console.log(`   - Reasoning: ${result.reasoning}`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Test different conditions
async function testDifferentConditions() {
  console.log("\n" + "=".repeat(60));
  console.log("🔍 Testing Different Item Conditions\n");

  const conditions = ["new", "excellent", "good", "fair", "poor"];

  for (const condition of conditions) {
    console.log(`Testing condition: "${condition}"`);
    const result = await localPricingService.estimatePrice({
      image: mockImage,
      condition: condition,
      userDescription: "Nike shoes",
      ebayResults: mockEbayResults,
    });
    console.log(`   Low: $${result.lowPrice}, Suggested: $${result.suggestedPrice}, High: $${result.highPrice}\n`);
  }
}

// Test no comparables
async function testNoComparables() {
  console.log("\n" + "=".repeat(60));
  console.log("🔍 Testing No Comparables\n");

  const result = await localPricingService.estimatePrice({
    image: mockImage,
    condition: "used",
    userDescription: "Rare Nike item",
    ebayResults: { itemSummaries: [] },
  });

  console.log("Result (no comparables):\n");
  console.log(JSON.stringify(result, null, 2));
}

// Run all tests
async function runAllTests() {
  await testLocalPricing();
  await testDifferentConditions();
  await testNoComparables();
}

runAllTests().catch(err => console.error("Test failed:", err));
