// This file creates one shared axios instance for talking to our backend.
// It automatically attaches the JWT token (if the user is logged in) to every request.
// Every page/component imports "api" from here instead of writing fetch/axios calls everywhere.

import axios from 'axios';

// Change this if your backend runs on a different URL
const API_BASE_URL = 'https://golf-charity-backend-hc8u.onrender.com/';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Before every request, check localStorage for a saved token and attach it
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
