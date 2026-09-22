import axios from 'axios';
import storage from '../utils/storage';
import { ApiConfig } from '../config/ApiConfig';

/**
 * Reusable Axios HTTP client.
 * Preconfigured with base URL, timeout, request interceptor (Authorization Bearer),
 * and response error handling.
 */
const httpClient = axios.create({
  baseURL: ApiConfig.getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: ApiConfig.TIMEOUT_MS,
});

// Interceptor to inject the JWT Bearer token into outgoing requests
httpClient.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle unauthenticated 401 responses globally
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local session if token is rejected or invalid
      storage.removeToken();
    }
    return Promise.reject(error);
  }
);

export default httpClient;
