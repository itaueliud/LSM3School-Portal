import axios from 'axios';

const envBaseUrl = import.meta.env.VITE_API_URL?.trim();
const cleanedBaseUrl = envBaseUrl?.replace(/\/+$/, '');
const normalizedBaseUrl = cleanedBaseUrl
  ? `${cleanedBaseUrl}${cleanedBaseUrl.endsWith('/api') ? '' : '/api'}`
  : '/api';

const api = axios.create({
  baseURL: normalizedBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
