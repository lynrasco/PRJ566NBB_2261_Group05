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

export const getEbayListings = async (query: string) => {
  const response = await apiClient.post('/ebay/listings', {
    query,
    limit: 12,
  });
  return response.data.listings;
};

export default apiClient;