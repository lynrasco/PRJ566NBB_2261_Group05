import axios from 'axios';
import { readAsStringAsync } from 'expo-file-system/legacy';

// Base URL for the backend - update this if running on a different host/port
// For testing, replace localhost with your machine's IP address if running on a mobile device
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

  return response.data.ebayResults.itemSummaries.map((item: any) => ({
    id: item.itemId,
    marketplace: 'eBay',
    title: item.title,
    price: item.price
      ? `${item.price.currency} ${item.price.value}`
      : 'Price not available',
    imageUrl: item.image?.imageUrl,
    url: item.itemWebUrl,
  }));
};

export default apiClient;
