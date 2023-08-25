// src/services/api.js

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';  // Thay đổi URL của Flask API

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const fetchWebsites = async () => {
  try {
    const response = await api.get('/api/websites');
    return response.data;
  } catch (error) {
    console.error('Error fetching websites:', error);
    throw error;
  }
};

export const addWebsite = async (name, link) => {
  try {
    const response = await api.post('/api/websites', { name, link });
    return response.data;
  } catch (error) {
    console.error('Error adding website:', error);
    throw error;
  }
};

export const deleteWebsite = async (websiteName) => {
  try {
    const response = await api.delete(`/api/websites/${websiteName}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting website:', error);
    throw error;
  }
};

// ...Các hàm gọi API khác nếu cần
