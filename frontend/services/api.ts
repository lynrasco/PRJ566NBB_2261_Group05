import { create } from "axios";
import Constants from "expo-constants";
import { readAsStringAsync } from "expo-file-system/legacy";
import { error as logError } from "@/utils/logger";

const getApiBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envUrl) return envUrl;

  const debuggerHost =
    Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  if (debuggerHost) {
    const host = debuggerHost.split(":")[0];
    return `http://${host}:3000/api`;
  }

  return "http://localhost:3000/api";
};

const API_BASE_URL = getApiBaseUrl();

let authToken: string | null = null;

const apiClient = create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: any) => {
    await logError(error, {
      operation: "axiosResponse",
      method: error?.config?.method,
      url: error?.config?.url,
      status: error?.response?.status,
      data: error?.response?.data,
    });
    return Promise.reject(error);
  },
);

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const clearAuthToken = () => {
  authToken = null;
};

export const getAllItems = async () => {
  try {
    const response = await apiClient.get("/items");
    return response.data;
  } catch (error) {
    await logError(error, { operation: "getAllItems" });
    console.error("Error fetching items:", error);
    throw error;
  }
};

export const getItemById = async (id: string) => {
  try {
    const response = await apiClient.get(`/items/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching item ${id}:`, error);
    throw error;
  }
};

export const getDashboardAnalytics = async (userId?: string) => {
  try {
    const response = await apiClient.get("/analytics/me", {
      params: userId ? { userId } : undefined,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    throw error;
  }
};

export const getItemMarketAnalytics = async (itemId: string) => {
  try {
    const response = await apiClient.get(`/analytics/items/${itemId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching market analytics for item ${itemId}:`, error);
    throw error;
  }
};

export const saveItemToMyItems = async (item: {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  categoryId?: string;
  brand?: string;
  condition?: string;
  imageUrl?: string;
}) => {
  try {
    const formData = new FormData();

    appendFormValue(formData, "title", item.title);
    appendFormValue(formData, "description", item.description);
    appendFormValue(formData, "price", item.price);
    appendFormValue(formData, "category", item.category);
    appendFormValue(formData, "categoryId", item.categoryId);
    appendFormValue(formData, "brand", item.brand);
    appendFormValue(formData, "condition", item.condition);
    appendFormValue(formData, "imageUrl", item.imageUrl);

    if (item.imageUrl && !/^https?:\/\//i.test(item.imageUrl)) {
      formData.append("image", {
        uri: item.imageUrl,
        name: "item-image.jpg",
        type: "image/jpeg",
      } as any);
    }

    const response = await apiClient.post("/items/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error saving item:", error);
    throw error;
  }
};

function appendFormValue(
  formData: FormData,
  key: string,
  value?: string | number,
) {
  if (value == null || value === "") return;
  formData.append(key, String(value));
}

export const uploadImage = async (imageUri: string) => {
  const imageBase64 = await readAsStringAsync(imageUri, {
    encoding: "base64" as any,
  });

  return {
    imageUrl: imageUri,
    imageBase64,
  };
};

export const processImage = async (
  imageInput:
    | string
    | {
        imageId?: string;
        imageUrl?: string;
        imageBase64?: string;
        aiTags?: string[];
        aiDescription?: string;
      },
  userDescription?: string,
) => {
  const payload =
    typeof imageInput === "string"
      ? { imageUrl: imageInput, userDescription }
      : { ...imageInput, userDescription };

  const response = await apiClient.post("/ai/process-image", payload);

  return response.data.image;
};

export const listItemToEbay = async (item: {
  id?: string;
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  categoryId?: string;
  brand?: string;
  condition?: string;
  imageUrl?: string;
}) => {
  try {
    const response = await apiClient.post("/ebay/listings", item);
    return response.data;
  } catch (error) {
    console.error(
      "Error pushing item to eBay:",
      (error as any)?.response?.data || error,
    );
    throw error;
  }
};

export const searchFromImage = async (
  imageInput:
    | string
    | {
        imageId?: string;
        imageUrl?: string;
        imageBase64?: string;
        aiTags?: string[];
        aiDescription?: string;
      },
  conditionId?: string,
  userDescription?: string,
) => {
  const payload =
    typeof imageInput === "string"
      ? { imageUrl: imageInput, condition: conditionId, userDescription }
      : { ...imageInput, condition: conditionId, userDescription };

  const response = await apiClient.post("/ai/search-ebay", payload);
  console.log("EBAY RAW RESPONSE:", response.data.ebayResults);
  const results = response.data?.ebayResults?.itemSummaries;

  if (!Array.isArray(results)) {
    console.log("No eBay results:", response.data.ebayResults);
    return [];
  }

  return results.map((item: any) => {
    const ebayCategories = Array.isArray(item.categories)
      ? item.categories
      : [];

    const primaryLeafCategoryId =
      Array.isArray(item.leafCategoryIds) && item.leafCategoryIds.length > 0
        ? item.leafCategoryIds[0]
        : item.categoryId;

    const ebayCategory =
      ebayCategories.find(
        (category: any) =>
          String(category.categoryId) === String(primaryLeafCategoryId),
      ) ||
      ebayCategories[ebayCategories.length - 1] ||
      null;

    return {
      id: item.itemId,
      marketplace: "eBay",
      title: item.title,
      brand: item.brand,

      category:
        ebayCategory?.categoryName ||
        item.categoryName ||
        item.categoryPath ||
        "",

      categoryId: primaryLeafCategoryId || ebayCategory?.categoryId || "",

      description:
        item.shortDescription ||
        item.subtitle ||
        item.additionalProductIdentities?.[0]?.identifierValue ||
        "",

      condition: item.condition,

      price: item.price
        ? `${item.price.currency} ${item.price.value}`
        : "Price not available",

      priceLow: item.priceLow,
      priceHigh: item.priceHigh,
      suggestedPrice: item.suggestedPrice,
      confidence: item.confidence,
      pricePositionPercent: item.pricePositionPercent,
      imageUrl: extractImage(item),
      url: item.itemWebUrl,
    };
  });
};

function extractImage(item: any): string | null {
  return (
    item.thumbnailImages?.[0]?.imageUrl ||
    item.additionalImages?.[0]?.imageUrl ||
    item.image?.imageUrl ||
    item.image?.url ||
    item.thumbnailImage ||
    null
  );
}

export const deleteItem = async (itemId: string) => {
  const response = await apiClient.delete(`/items/${itemId}`);
  return response.data;
};

export const updateItem = async (
  id: string,
  item: {
    title?: string;
    description?: string;
    price?: number;
    category?: string;
    categoryId?: string;
    brand?: string;
    imageUrl?: string;
  },
) => {
  try {
    const response = await apiClient.put(`/items/${id}`, item);
    return response.data;
  } catch (error) {
    console.error(`Error updating item ${id}:`, error);
    throw error;
  }
};

// export const loginUser = async (email: string, password: string) => {
//   const response = await apiClient.post("/auth/login", {
//     email,
//     password,
//   });

//   return response.data;
// };

export type NotificationSettings = {
  pushEnabled: boolean;
  priceAlerts: boolean;
  marketUpdates: boolean;
  securityAlerts: boolean;
};

export const getNotificationSettings = async (userId: string) => {
  const response = await apiClient.get(`/users/${userId}/notifications`);

  return response.data;
};

export const updateNotificationSettings = async (
  userId: string,
  settings: NotificationSettings,
  expoPushToken?: string | null,
) => {
  const response = await apiClient.put(`/users/${userId}/notifications`, {
    ...settings,
    expoPushToken,
  });

  return response.data;
};

export const sendTestNotification = async (userId: string) => {
  const response = await apiClient.post(`/users/${userId}/notifications/test`);

  return response.data;
};

export const login = async (email: string, password: string) => {
  try {
    const response = await apiClient.post("/auth/login", { email, password });
    const data = response.data;
    const token = data?.token || data?.user?.token || data?.user?.user?.token;
    if (token) {
      setAuthToken(token);
    }
    return data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error?.message ||
      error?.message ||
      "Login failed";
    throw new Error(message);
  }
};

export const register = async (
  name: string,
  email: string,
  password: string,
) => {
  try {
    const response = await apiClient.post("/auth/register", {
      name,
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error?.message ||
      error?.message ||
      "Registration failed";
    console.error("Registration failed:", message);
    throw new Error(message);
  }
};

export const updatePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  try {
    const response = await apiClient.put(`/users/${userId}/password`, {
      currentPassword,
      newPassword,
    });

    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Password update failed";
    console.error("updatePassword failed:", message);
    throw new Error(message);
  }
};

export default apiClient;
