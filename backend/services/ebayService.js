const EBAY_CLIENT_ID = process.env.EBAY_CLIENT_ID;
const EBAY_CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET;
const EBAY_ENVIRONMENT = (process.env.EBAY_ENVIRONMENT || "sandbox").toLowerCase();

const API_BASE = EBAY_ENVIRONMENT === "production"
  ? "https://api.ebay.com"
  : "https://api.sandbox.ebay.com";

let tokenCache = null;

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
    throw new Error(`eBay OAuth token request failed: ${response.status} ${body}`);
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
    throw new Error(`eBay Browse API request failed: ${response.status} ${body}`);
  }

  return response.json();
};

module.exports = {
  searchItems,
};
