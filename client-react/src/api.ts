// src/api.ts
import axios from 'axios';
const api = axios.create({
  baseURL: 'http://192.168.1.164:3000',
  withCredentials: true,
});
export default api;