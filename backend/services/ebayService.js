const EBAY_CLIENT_ID = process.env.EBAY_CLIENT_ID;
const EBAY_CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET;
const EBAY_ENVIRONMENT = (process.env.EBAY_ENVIRONMENT || "sandbox").toLowerCase();
const EBAY_MARKETPLACE_ID = process.env.EBAY_MARKETPLACE_ID || "EBAY_US";
const EBAY_CURRENCY = process.env.EBAY_CURRENCY || "USD";
const EBAY_LOCALE = process.env.EBAY_LOCALE || "en-US";
const EBAY_DEFAULT_CATEGORY_ID = process.env.EBAY_DEFAULT_CATEGORY_ID;
const EBAY_CLOTHING_CATEGORY_ID = process.env.EBAY_CLOTHING_CATEGORY_ID || "15724";
const EBAY_BAGS_CATEGORY_ID = process.env.EBAY_BAGS_CATEGORY_ID || "169291";
const EBAY_ACCESSORIES_CATEGORY_ID = process.env.EBAY_ACCESSORIES_CATEGORY_ID || "4254";
const EBAY_MERCHANT_LOCATION_KEY = process.env.EBAY_MERCHANT_LOCATION_KEY;
const EBAY_PAYMENT_POLICY_ID = process.env.EBAY_PAYMENT_POLICY_ID;
const EBAY_RETURN_POLICY_ID = process.env.EBAY_RETURN_POLICY_ID;
const EBAY_FULFILLMENT_POLICY_ID = process.env.EBAY_FULFILLMENT_POLICY_ID;
const EBAY_SELLER_REFRESH_TOKEN = process.env.EBAY_SELLER_REFRESH_TOKEN;
const EBAY_SELLER_SCOPES = process.env.EBAY_SELLER_SCOPES ||
  "https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account";

const API_BASE = EBAY_ENVIRONMENT === "production"
  ? "https://api.ebay.com"
  : "https://api.sandbox.ebay.com";
const FALLBACK_IMAGE_URL = process.env.EBAY_FALLBACK_IMAGE_URL || "https://picsum.photos/seed/flipvalue/1200/1200";

let tokenCache = null;
let sellerTokenCache = null;

const EBAY_DEBUG_SELLER_TOKEN = String(process.env.EBAY_DEBUG_SELLER_TOKEN || "").toLowerCase() === "true";

class EbayApiError extends Error {
  constructor(message, { statusCode = 502, ebayStatus, stage, details } = {}) {
    super(message);
    this.name = "EbayApiError";
    this.statusCode = statusCode;
    this.ebayStatus = ebayStatus;
    this.stage = stage;
    this.details = details;
  }
}

const parseEbayResponseBody = (body) => {
  if (!body) return null;

  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
};

const throwEbayResponseError = (stage, response, body) => {
  const details = parseEbayResponseBody(body);
  const ebayMessage =
    details?.errors?.[0]?.message ||
    details?.errors?.[0]?.longMessage ||
    details?.message ||
    body ||
    "eBay request failed";
  const authHint = response.status === 401
    ? " Check that EBAY_SELLER_TOKEN/EBAY_SELLER_REFRESH_TOKEN is current, belongs to the same sandbox/production environment, and includes seller scopes."
    : "";

  throw new EbayApiError(`${stage} failed: ${ebayMessage}${authHint}`, {
    statusCode: response.status >= 400 && response.status < 500 ? response.status : 502,
    ebayStatus: response.status,
    stage,
    details,
  });
};

const isExistingOfferError = (details) => {
  const message = [
    details?.message,
    details?.errors?.[0]?.message,
    details?.errors?.[0]?.longMessage,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return message.includes("offer entity already exists");
};

const getRequiredEnv = (key, value) => {
  if (!value || !String(value).trim()) {
    throw new EbayApiError(
      `Missing ${key}. This eBay seller setting is required to create listings. Call GET /api/ebay/seller-policies to find the policy IDs for this seller account.`,
      {
        statusCode: 500,
        stage: "configuration",
      }
    );
  }

  return String(value).trim();
};

const getSellerApiHeaders = (accessToken) => ({
  Authorization: `Bearer ${accessToken}`,
  Accept: "application/json",
  "Accept-Language": EBAY_LOCALE,
  "Content-Language": EBAY_LOCALE,
  "Content-Type": "application/json",
  "X-EBAY-C-MARKETPLACE-ID": EBAY_MARKETPLACE_ID,
});

const getTokenFingerprint = (token) => {
  const normalized = typeof token === "string"
    ? token.trim().replace(/^Bearer\s+/i, "")
    : "";

  if (!normalized) {
    return {
      tokenLength: 0,
      firstCharCode: null,
      lastCharCode: null,
    };
  }

  return {
    tokenLength: normalized.length,
    firstCharCode: normalized.charCodeAt(0),
    lastCharCode: normalized.charCodeAt(normalized.length - 1),
  };
};

const logSellerTokenDebug = (source, token) => {
  if (!EBAY_DEBUG_SELLER_TOKEN) return;

  console.log("eBay seller token debug:", {
    source,
    environment: EBAY_ENVIRONMENT,
    marketplace: EBAY_MARKETPLACE_ID,
    ...getTokenFingerprint(token),
  });
};

const normalizePositivePrice = (price) => {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    const error = new Error("A listing price greater than 0 is required");
    error.statusCode = 400;
    throw error;
  }

  return numericPrice.toFixed(2);
};

const normalizeEbayCondition = (condition) => {
  const rawCondition = typeof condition === "string" ? condition.trim() : "";
  const normalized = rawCondition.toLowerCase().replace(/[_-]+/g, " ");

  const conditionMap = {
    new: "NEW",
    "brand new": "NEW",
    "new with tags": "NEW",
    "new with box": "NEW",
    "new without tags": "NEW_OTHER",
    "new without box": "NEW_OTHER",
    "open box": "NEW_OTHER",
    "like new": "PRE_OWNED_EXCELLENT",
    "new other": "NEW_OTHER",
    "new with defects": "NEW_WITH_DEFECTS",
    refurbished: "SELLER_REFURBISHED",
    "seller refurbished": "SELLER_REFURBISHED",
    "manufacturer refurbished": "MANUFACTURER_REFURBISHED",
    used: "USED_EXCELLENT",
    "pre owned": "USED_EXCELLENT",
    preowned: "USED_EXCELLENT",
    "used excellent": "PRE_OWNED_EXCELLENT",
    excellent: "PRE_OWNED_EXCELLENT",
    "very good": "USED_EXCELLENT",
    good: "USED_EXCELLENT",
    acceptable: "PRE_OWNED_FAIR",
    poor: "PRE_OWNED_FAIR",
    "for parts": "FOR_PARTS_OR_NOT_WORKING",
    "parts only": "FOR_PARTS_OR_NOT_WORKING",
    "not working": "FOR_PARTS_OR_NOT_WORKING",
    damaged: "FOR_PARTS_OR_NOT_WORKING",
  };

  const allowedConditions = new Set([
    "NEW",
    "LIKE_NEW",
    "NEW_OTHER",
    "NEW_WITH_DEFECTS",
    "MANUFACTURER_REFURBISHED",
    "SELLER_REFURBISHED",
    "USED_EXCELLENT",
    "USED_VERY_GOOD",
    "USED_GOOD",
    "USED_ACCEPTABLE",
    "PRE_OWNED_EXCELLENT",
    "PRE_OWNED_FAIR",
    "FOR_PARTS_OR_NOT_WORKING",
  ]);

  const upperCondition = rawCondition.toUpperCase();
  if (allowedConditions.has(upperCondition)) {
    return upperCondition;
  }

  if (conditionMap[normalized]) {
    return conditionMap[normalized];
  }

  return normalized.includes("new") ? "NEW" : "USED_EXCELLENT";
};

const normalizeConditionForCategory = (ebayCondition, categoryId) => {
  const fashionCategoryIds = new Set([
    String(EBAY_CLOTHING_CATEGORY_ID),
    String(EBAY_BAGS_CATEGORY_ID),
    String(EBAY_ACCESSORIES_CATEGORY_ID),
  ]);

  if (!fashionCategoryIds.has(String(categoryId))) {
    return ebayCondition;
  }

  if (ebayCondition === "NEW") {
    return "NEW";
  }

  if (ebayCondition === "NEW_OTHER" || ebayCondition === "LIKE_NEW") {
    return "PRE_OWNED_EXCELLENT";
  }

  if (ebayCondition.startsWith("USED_") || ebayCondition.startsWith("PRE_OWNED_")) {
    return ebayCondition.includes("FAIR") || ebayCondition.includes("ACCEPTABLE")
      ? "PRE_OWNED_FAIR"
      : "PRE_OWNED_EXCELLENT";
  }

  if (ebayCondition === "FOR_PARTS_OR_NOT_WORKING") {
    return "PRE_OWNED_FAIR";
  }

  return "PRE_OWNED_EXCELLENT";
};

const isFashionCategory = (categoryId) => {
  const id = String(categoryId || "");
  return id === String(EBAY_CLOTHING_CATEGORY_ID)
    || id === String(EBAY_BAGS_CATEGORY_ID)
    || id === String(EBAY_ACCESSORIES_CATEGORY_ID);
};

const isInvalidConditionForCategoryError = (error) => {
  const rawMessage = [
    error?.message,
    error?.details?.message,
    error?.details?.errors?.[0]?.message,
    error?.details?.errors?.[0]?.longMessage,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return rawMessage.includes("invalid item condition")
    || rawMessage.includes("condition id is invalid");
};

const inferEbayCategoryId = (item) => {
  if (item.categoryId) return item.categoryId;

  const category = typeof item.category === "string" ? item.category.toLowerCase() : "";
  const title = typeof item.title === "string" ? item.title.toLowerCase() : "";
  const searchableText = `${category} ${title}`;

  if (/\b(bag|handbag|purse|tote|crossbody|satchel|clutch|backpack|duffel|luggage)\b/.test(searchableText)) {
    return EBAY_BAGS_CATEGORY_ID;
  }

  if (/\b(accessory|accessories|belt|wallet|watch|jewelry|necklace|bracelet|ring|earring|sunglasses|scarf|hat|cap|gloves)\b/.test(searchableText)) {
    return EBAY_ACCESSORIES_CATEGORY_ID;
  }

  if (/\b(clothing|apparel|shirt|t\s?-?shirt|tee|blouse|dress|skirt|pants|trousers|jeans|shorts|hoodie|sweater|cardigan|jacket|coat|suit|blazer|activewear|leggings|top)\b/.test(searchableText)) {
    return EBAY_CLOTHING_CATEGORY_ID;
  }

  const error = new Error(
    "Unsupported listing category. FlipValue currently supports only clothing, bags, and accessories for eBay listings."
  );
  error.statusCode = 400;
  throw error;
};

const inferDepartment = (item) => {
  const category = typeof item.category === "string" ? item.category.toLowerCase() : "";
  const title = typeof item.title === "string" ? item.title.toLowerCase() : "";
  const text = `${category} ${title}`;

  if (/\b(men|mens|man|male|gent|gents|boy|boys)\b/.test(text)) {
    return "Men";
  }

  if (/\b(women|womens|woman|female|lady|ladies|girl|girls)\b/.test(text)) {
    return "Women";
  }

  if (/\b(kid|kids|child|children|youth|toddler|infant|baby)\b/.test(text)) {
    return "Kids";
  }

  return "Unisex Adults";
};

const inferExteriorMaterial = (item) => {
  const category = typeof item.category === "string" ? item.category.toLowerCase() : "";
  const title = typeof item.title === "string" ? item.title.toLowerCase() : "";
  const description = typeof item.description === "string" ? item.description.toLowerCase() : "";
  const text = `${category} ${title} ${description}`;

  if (/\bleather\b/.test(text)) return "Leather";
  if (/\bsuede\b/.test(text)) return "Suede";
  if (/\bcanvas\b/.test(text)) return "Canvas";
  if (/\bnylon\b/.test(text)) return "Nylon";
  if (/\bpolyester\b/.test(text)) return "Polyester";
  if (/\bdenim\b/.test(text)) return "Denim";
  if (/\bstraw\b/.test(text)) return "Straw";
  if (/\bvelvet\b/.test(text)) return "Velvet";

  // Conservative default for fashion bags/accessories when material is not provided.
  return "Leather";
};

const inferStyle = (item) => {
  const category = typeof item.category === "string" ? item.category.toLowerCase() : "";
  const title = typeof item.title === "string" ? item.title.toLowerCase() : "";
  const description = typeof item.description === "string" ? item.description.toLowerCase() : "";
  const text = `${category} ${title} ${description}`;

  if (/\bcrossbody\b/.test(text)) return "Crossbody";
  if (/\btote\b/.test(text)) return "Tote";
  if (/\bsatchel\b/.test(text)) return "Satchel";
  if (/\bclutch\b/.test(text)) return "Clutch";
  if (/\bshoulder\b/.test(text)) return "Shoulder Bag";
  if (/\bbackpack\b/.test(text)) return "Backpack";
  if (/\bwallet\b/.test(text)) return "Wallet";

  return "Top Handle Bag";
};

const inferModel = (item) => {
  if (typeof item.model === "string" && item.model.trim()) {
    return item.model.trim();
  }

  const title = typeof item.title === "string" ? item.title.trim() : "";
  if (!title) {
    return "Not Specified";
  }

  const collapsed = title.replace(/\s+/g, " ");
  return collapsed.length > 80 ? collapsed.slice(0, 80).trim() : collapsed;
};

const normalizeListingItem = (item) => {
  if (!item || typeof item !== "object") {
    const error = new Error("Listing item information is required");
    error.statusCode = 400;
    throw error;
  }

  const title = typeof item.title === "string" ? item.title.trim() : "";
  if (!title) {
    const error = new Error("Listing title is required");
    error.statusCode = 400;
    throw error;
  }

  const categoryId = inferEbayCategoryId(item);
  const baseCondition = normalizeEbayCondition(item.condition);

  return {
    ...item,
    title,
    description: typeof item.description === "string" && item.description.trim()
      ? item.description.trim()
      : title,
    brand: typeof item.brand === "string" && item.brand.trim() ? item.brand.trim() : "Unbranded",
    model: inferModel(item),
    color: typeof item.color === "string" && item.color.trim() ? item.color.trim() : "Multicolor",
    department: typeof item.department === "string" && item.department.trim() ? item.department.trim() : inferDepartment(item),
    exteriorMaterial: typeof item.exteriorMaterial === "string" && item.exteriorMaterial.trim()
      ? item.exteriorMaterial.trim()
      : inferExteriorMaterial(item),
    style: typeof item.style === "string" && item.style.trim() ? item.style.trim() : inferStyle(item),
    condition: typeof item.condition === "string" && item.condition.trim() ? item.condition.trim() : "Used",
    ebayCondition: normalizeConditionForCategory(baseCondition, categoryId),
    quantity: Math.max(1, Number.parseInt(item.quantity, 10) || 1),
    price: normalizePositivePrice(item.price),
    categoryId,
  };
};

const generateFallbackQueries = (query) => {
  // If a query returns no results, try progressively broader versions
  const tokens = query.split(/\s+/).filter(Boolean);
  
  if (tokens.length <= 1) return []; // No point in fallbacks if query is already minimal
  
  // Strategy: remove tokens one by one, favoring keeping brand + object type
  const fallbacks = [];
  
  // Remove model/specific tokens first
  if (tokens.length > 2) {
    fallbacks.push(tokens.slice(0, 2).join(" ")); // Keep first 2 tokens (usually brand + object)
  }
  
  // Then try just the first token (usually brand)
  if (tokens.length > 1) {
    fallbacks.push(tokens[0]);
  }
  
  // Generic fallback: reconstruct from core terms
  const brand = tokens[0];
  const lastToken = tokens[tokens.length - 1];
  if (brand !== lastToken) {
    fallbacks.push(`${brand} ${lastToken}`);
  }
  
  return fallbacks.filter((q, i, arr) => arr.indexOf(q) === i); // deduplicate
};

const getEbayToken = async () => {
  if (!EBAY_CLIENT_ID || !EBAY_CLIENT_SECRET) {
    throw new Error("Missing EBAY_CLIENT_ID or EBAY_CLIENT_SECRET in environment variables");
  }

  if (tokenCache && tokenCache.expireAt > Date.now()) {
    return tokenCache.accessToken;
  }

  const auth = Buffer.from(`${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`).toString("base64");
  const form = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "https://api.ebay.com/oauth/api_scope",
  });

  const response = await fetch(`${API_BASE}/identity/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  if (!response.ok) {
    const body = await response.text();
    throwEbayResponseError("eBay OAuth token request", response, body);
  }

  const data = await response.json();
  const expiresIn = Number(data.expires_in || 0);

  tokenCache = {
    accessToken: data.access_token,
    expireAt: Date.now() + (expiresIn > 0 ? expiresIn * 1000 : 3600 * 1000),
  };

  return tokenCache.accessToken;
};

const searchItems = async (query, conditionId = null, limit = 12) => {
  if (!query || !query.trim()) {
    throw new Error("Search query is required to call eBay Browse API");
  }

  const accessToken = await getEbayToken();
  
  // Try primary query
  let result = await _fetchSearchResults(accessToken, query, conditionId, limit);
  
  // If no results, try fallback queries
  if (result.total === 0) {
    const fallbacks = generateFallbackQueries(query);
    for (const fallbackQuery of fallbacks) {
      result = await _fetchSearchResults(accessToken, fallbackQuery, conditionId, limit);
      if (result.total > 0) {
        console.log(`eBay fallback search succeeded: "${fallbackQuery}" (original: "${query}")`);
        result.originalQuery = query;
        result.fallbackQuery = fallbackQuery;
        break;
      }
    }
  }
  
  return result;
};

const getEbaySellerToken = async () => {
  if (sellerTokenCache && sellerTokenCache.expireAt > Date.now()) {
    logSellerTokenDebug("cache", sellerTokenCache.accessToken);
    return sellerTokenCache.accessToken;
  }

  if (EBAY_SELLER_REFRESH_TOKEN && EBAY_SELLER_REFRESH_TOKEN.trim()) {
    const refreshedToken = await refreshEbaySellerToken(EBAY_SELLER_REFRESH_TOKEN.trim());
    logSellerTokenDebug("refresh_token", refreshedToken);
    return refreshedToken;
  }

  const sellerToken = process.env.EBAY_SELLER_TOKEN;
  if (!sellerToken) {
    throw new Error(
      "Missing EBAY_SELLER_TOKEN or EBAY_SELLER_REFRESH_TOKEN. A seller OAuth token is required to create listings."
    );
  }

  const normalizedToken = sellerToken.trim().replace(/^Bearer\s+/i, '');
  if (!normalizedToken) {
    throw new Error('EBAY_SELLER_TOKEN is empty after trimming.');
  }

  logSellerTokenDebug("seller_token", normalizedToken);

  return normalizedToken;
};

const refreshEbaySellerToken = async (refreshToken) => {
  if (!EBAY_CLIENT_ID || !EBAY_CLIENT_SECRET) {
    throw new Error("Missing EBAY_CLIENT_ID or EBAY_CLIENT_SECRET in environment variables");
  }

  const auth = Buffer.from(`${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`).toString("base64");
  const form = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    scope: EBAY_SELLER_SCOPES,
  });

  const response = await fetch(`${API_BASE}/identity/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  if (!response.ok) {
    const body = await response.text();
    throwEbayResponseError("Refresh eBay seller OAuth token", response, body);
  }

  const data = await response.json();
  const expiresIn = Number(data.expires_in || 0);

  sellerTokenCache = {
    accessToken: data.access_token,
    expireAt: Date.now() + (expiresIn > 0 ? expiresIn * 1000 : 2 * 60 * 60 * 1000) - 60 * 1000,
  };

  return sellerTokenCache.accessToken;
};

const createInventoryItem = async (sku, item, accessToken) => {
  const rawImageUrl = item.imageUrl && typeof item.imageUrl === 'string' ? item.imageUrl.trim() : '';
  const imageUrl = rawImageUrl && /^https?:\/\//i.test(rawImageUrl)
    ? rawImageUrl
    : FALLBACK_IMAGE_URL;

  if (!imageUrl) {
    throw new Error('A public image URL is required to create an eBay inventory item.');
  }

  if (rawImageUrl && !/^https?:\/\//i.test(rawImageUrl)) {
    console.warn('Using fallback image URL because the provided image was not a public URL:', rawImageUrl);
  }

  const payload = {
    sku,
    condition: item.ebayCondition,
    product: {
      title: item.title,
      description: item.description || item.title,
      aspects: {
        Brand: item.brand ? [item.brand] : ['Unknown'],
        Color: item.color ? [item.color] : ["Multicolor"],
        Department: item.department ? [item.department] : ["Unisex Adults"],
        ...(String(item.categoryId) === String(EBAY_BAGS_CATEGORY_ID) || String(item.categoryId) === String(EBAY_ACCESSORIES_CATEGORY_ID)
          ? {
            "Exterior Material": [item.exteriorMaterial || "Leather"],
            "Exterior Color": [item.color || "Multicolor"],
            Style: [item.style || "Top Handle Bag"],
          }
          : {}),
        ...(item.model ? { Model: [item.model] } : {}),
      },
      imageUrls: [imageUrl],
    },
    availability: {
      shipToLocationAvailability: {
        quantity: item.quantity || 1,
      },
    },
  };

  const response = await fetch(`${API_BASE}/sell/inventory/v1/inventory_item/${encodeURIComponent(sku)}`, {
    method: 'PUT',
    headers: getSellerApiHeaders(accessToken),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throwEbayResponseError("Create eBay inventory item", response, body);
  }

  return response.status === 204 ? null : await response.json();
};

const getExistingOfferForSku = async (sku, accessToken) => {
  const params = new URLSearchParams({
    sku,
    marketplace_id: EBAY_MARKETPLACE_ID,
  });

  const response = await fetch(`${API_BASE}/sell/inventory/v1/offer?${params.toString()}`, {
    method: "GET",
    headers: getSellerApiHeaders(accessToken),
  });

  if (!response.ok) {
    const body = await response.text();
    throwEbayResponseError("Get existing eBay offer", response, body);
  }

  const data = await response.json();
  const offers = Array.isArray(data?.offers)
    ? data.offers
    : Array.isArray(data?.offerSummaries)
      ? data.offerSummaries
      : [];

  const offer = offers.find((candidate) => candidate?.offerId);
  if (!offer) {
    throw new EbayApiError("eBay says an offer already exists, but no offer was returned for this SKU.", {
      statusCode: 502,
      stage: "Get existing eBay offer",
      details: data,
    });
  }

  return offer;
};

const createOffer = async (sku, item, accessToken) => {
  const merchantLocationKey = getRequiredEnv("EBAY_MERCHANT_LOCATION_KEY", EBAY_MERCHANT_LOCATION_KEY);
  const paymentPolicyId = getRequiredEnv("EBAY_PAYMENT_POLICY_ID", EBAY_PAYMENT_POLICY_ID);
  const returnPolicyId = getRequiredEnv("EBAY_RETURN_POLICY_ID", EBAY_RETURN_POLICY_ID);
  const fulfillmentPolicyId = getRequiredEnv("EBAY_FULFILLMENT_POLICY_ID", EBAY_FULFILLMENT_POLICY_ID);

  if (!item.categoryId) {
    throw new EbayApiError(
      "Missing EBAY_DEFAULT_CATEGORY_ID or item.categoryId. eBay offers require a numeric category ID.",
      {
        statusCode: 500,
        stage: "configuration",
      }
    );
  }

  const payload = {
    sku,
    marketplaceId: EBAY_MARKETPLACE_ID,
    format: 'FIXED_PRICE',
    availableQuantity: item.quantity,
    categoryId: String(item.categoryId),
    merchantLocationKey,
    pricingSummary: {
      price: {
        value: item.price,
        currency: EBAY_CURRENCY,
      },
    },
    listingDescription: item.description || item.title,
    listingPolicies: {
      paymentPolicyId,
      returnPolicyId,
      fulfillmentPolicyId,
    },
  };

  const response = await fetch(`${API_BASE}/sell/inventory/v1/offer`, {
    method: 'POST',
    headers: getSellerApiHeaders(accessToken),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    const details = parseEbayResponseBody(body);
    if (response.status === 400 && isExistingOfferError(details)) {
      return await getExistingOfferForSku(sku, accessToken);
    }

    throwEbayResponseError("Create eBay offer", response, body);
  }

  return await response.json();
};

const fetchSellerPolicyCollection = async (accessToken, path, responseKey, stage) => {
  const params = new URLSearchParams({
    marketplace_id: EBAY_MARKETPLACE_ID,
  });

  const response = await fetch(`${API_BASE}/sell/account/v1/${path}?${params.toString()}`, {
    method: "GET",
    headers: getSellerApiHeaders(accessToken),
  });

  if (!response.ok) {
    const body = await response.text();
    throwEbayResponseError(stage, response, body);
  }

  const data = await response.json();
  return Array.isArray(data?.[responseKey]) ? data[responseKey] : [];
};

const summarizePolicy = (policy, idKey) => ({
  id: policy?.[idKey] || null,
  name: policy?.name || null,
  marketplaceId: policy?.marketplaceId || EBAY_MARKETPLACE_ID,
});

const getSellerPolicies = async () => {
  const accessToken = await getEbaySellerToken();
  const [paymentPolicies, returnPolicies, fulfillmentPolicies] = await Promise.all([
    fetchSellerPolicyCollection(accessToken, "payment_policy", "paymentPolicies", "Get eBay payment policies"),
    fetchSellerPolicyCollection(accessToken, "return_policy", "returnPolicies", "Get eBay return policies"),
    fetchSellerPolicyCollection(accessToken, "fulfillment_policy", "fulfillmentPolicies", "Get eBay fulfillment policies"),
  ]);

  const payment = paymentPolicies[0] ? summarizePolicy(paymentPolicies[0], "paymentPolicyId") : null;
  const returns = returnPolicies[0] ? summarizePolicy(returnPolicies[0], "returnPolicyId") : null;
  const fulfillment = fulfillmentPolicies[0] ? summarizePolicy(fulfillmentPolicies[0], "fulfillmentPolicyId") : null;

  return {
    marketplaceId: EBAY_MARKETPLACE_ID,
    policies: {
      payment: paymentPolicies.map((policy) => summarizePolicy(policy, "paymentPolicyId")),
      return: returnPolicies.map((policy) => summarizePolicy(policy, "returnPolicyId")),
      fulfillment: fulfillmentPolicies.map((policy) => summarizePolicy(policy, "fulfillmentPolicyId")),
    },
    env: {
      EBAY_PAYMENT_POLICY_ID: payment?.id || "",
      EBAY_RETURN_POLICY_ID: returns?.id || "",
      EBAY_FULFILLMENT_POLICY_ID: fulfillment?.id || "",
    },
  };
};

const publishOffer = async (offerId, accessToken) => {
  const response = await fetch(`${API_BASE}/sell/inventory/v1/offer/${encodeURIComponent(offerId)}/publish`, {
    method: 'POST',
    headers: getSellerApiHeaders(accessToken),
  });

  if (!response.ok) {
    const body = await response.text();
    throwEbayResponseError("Publish eBay offer", response, body);
  }

  return await response.json();
};

const createListing = async (item) => {
  const accessToken = await getEbaySellerToken();
  let listingItem = normalizeListingItem(item);
  const baseSku = listingItem.id
    ? String(listingItem.id).replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 40)
    : "flipvalue";
  const sku = `${baseSku}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  await createInventoryItem(sku, listingItem, accessToken);
  const offer = await createOffer(sku, listingItem, accessToken);

  let publishResult;
  try {
    publishResult = await publishOffer(offer.offerId, accessToken);
  } catch (error) {
    if (!isFashionCategory(listingItem.categoryId) || !isInvalidConditionForCategoryError(error)) {
      throw error;
    }

    const fallbackConditions = ["NEW", "PRE_OWNED_EXCELLENT", "PRE_OWNED_FAIR", "USED_EXCELLENT"]
      .filter((condition) => condition !== listingItem.ebayCondition);

    let recovered = false;
    for (const fallbackCondition of fallbackConditions) {
      try {
        listingItem = {
          ...listingItem,
          ebayCondition: fallbackCondition,
        };

        await createInventoryItem(sku, listingItem, accessToken);
        publishResult = await publishOffer(offer.offerId, accessToken);
        recovered = true;
        break;
      } catch (retryError) {
        if (!isInvalidConditionForCategoryError(retryError)) {
          throw retryError;
        }
      }
    }

    if (!recovered) {
      throw error;
    }
  }

  return { sku, offerId: offer.offerId, publishResult };
};

const _fetchSearchResults = async (accessToken, query, conditionId, limit) => {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
  });

  if (conditionId) {
    params.set("filter", `conditionIds:{${conditionId}}`);
  }

  const url = `${API_BASE}/buy/browse/v1/item_summary/search?${params.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throwEbayResponseError("eBay Browse API request", response, body);
  }

  return response.json();
};

module.exports = {
  searchItems,
  createListing,
  getSellerPolicies,
};
