import axios from 'axios';

// Base URL for the backend - update this if running on a different host/port
const API_BASE_URL = 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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

/*
export const getEbayListings = async (query: string, conditionId?: string) => {
  const response = await apiClient.post('/ebay/listings', {
    query,
    conditionId,
    limit: 12,
  });
  return response.data.listings;
};
*/

export const uploadImage = async (imageUri: string) => {
  const form = new FormData();

  form.append('image', {
    uri: imageUri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  } as any);

  const response = await apiClient.post('/images/upload', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.imageId;
};

export const processImage = async (imageId: string) => {
  const response = await apiClient.post('/ai/process-image', {
    imageId,
  });

  return response.data.image;
};

export const searchFromImage = async (
  imageId: string,
  conditionId?: string
) => {
  const response = await apiClient.post('/ai/search-ebay', {
    imageId,
    condition: conditionId,
  });

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