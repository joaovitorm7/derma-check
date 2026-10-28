import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://sad-insects-unite.loca.lt';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api; 