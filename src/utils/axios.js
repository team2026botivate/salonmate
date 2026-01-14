import axios from 'axios';

// Prefer Vite env var VITE_BACKEND_API. Fallback to local backend with /api prefix.
const BASE_URL = import.meta.env?.VITE_BACKEND_API || 'http://localhost:3003/api';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});
