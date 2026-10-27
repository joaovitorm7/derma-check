import { create } from 'axios';

const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000')
  .trim()
  .replace(/\/+$/, '');

export const api = create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});