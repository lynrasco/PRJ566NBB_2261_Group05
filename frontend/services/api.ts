import axios from 'axios';
import { readAsStringAsync } from 'expo-file-system/legacy';

const API_BASE_URL = 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAllItems = async () => {
  try {
    const response = await apiClient.get('/items');
    return response.data;
  } catch (error) {
    console.error('Error fetching items:', error);
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

export const saveItemToMyItems = async (item: {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  brand?: string;
  condition?: string;
  imageUrl?: string;
}) => {
  try {
    const formData = new FormData();

    appendFormValue(formData, 'title', item.title);
    appendFormValue(formData, 'description', item.description);
    appendFormValue(formData, 'price', item.price);
    appendFormValue(formData, 'category', item.category);
    appendFormValue(formData, 'brand', item.brand);
    appendFormValue(formData, 'condition', item.condition);

    if (item.imageUrl && !/^https?:\/\//i.test(item.imageUrl)) {
      formData.append('image', {
        uri: item.imageUrl,
        name: 'item-image.jpg',
        type: 'image/jpeg',
      } as any);
    }

    const response = await apiClient.post('/items/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error saving item:', error);
    throw error;
  }
};

function appendFormValue(formData: FormData, key: string, value?: string | number) {
  if (value == null || value === '') return;
  formData.append(key, String(value));
}

export const uploadImage = async (imageUri: string) => {
  const imageBase64 = await readAsStringAsync(imageUri, {
    encoding: 'base64' as any,
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
  userDescription?: string
) => {
  const payload =
    typeof imageInput === 'string'
      ? { imageUrl: imageInput, userDescription }
      : { ...imageInput, userDescription };

  const response = await apiClient.post('/ai/process-image', payload);

  return response.data.image;
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
  userDescription?: string
) => {
  const payload =
    typeof imageInput === 'string'
      ? { imageUrl: imageInput, condition: conditionId, userDescription }
      : { ...imageInput, condition: conditionId, userDescription };

  const response = await apiClient.post('/ai/search-ebay', payload);
  console.log('EBAY RAW RESPONSE:', response.data.ebayResults);
  const results = response.data?.ebayResults?.itemSummaries;

  if (!Array.isArray(results)) {
    console.log('No eBay results:', response.data.ebayResults);
    return [];
  }

  return results.map((item: any) => ({
    id: item.itemId,
    marketplace: 'eBay',
    title: item.title,
    brand: item.brand,
    category: item.categoryName || item.categoryPath || item.categories?.[0]?.categoryName,
    description:
      item.shortDescription ||
      item.subtitle ||
      item.additionalProductIdentities?.[0]?.identifierValue ||
      '',
    condition: item.condition,
    price: item.price ? `${item.price.currency} ${item.price.value}` : 'Price not available',
    priceLow: item.priceLow,
    priceHigh: item.priceHigh,
    suggestedPrice: item.suggestedPrice,
    confidence: item.confidence,
    pricePositionPercent: item.pricePositionPercent,
    imageUrl: extractImage(item),
    url: item.itemWebUrl,
  }));
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

export default apiClient;
