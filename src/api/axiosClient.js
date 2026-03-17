import axios from 'axios';
import { normalizeApiError } from './errors';

let accessToken = null;
let refreshHandler = null;

const shouldSkipRefresh = (url = '') =>
  url.includes('/login') ||
  url.includes('/auth/refresh') ||
  url.includes('/auth/logout');

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Đường dẫn đến Backend Fastify
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAccessToken = (token) => {
  accessToken = token || null;
};

export const clearAccessToken = () => {
  accessToken = null;
};

export const registerRefreshHandler = (handler) => {
  refreshHandler = handler;
};

// Interceptor: Tự động gắn access token hiện tại vào header nếu có
axiosClient.interceptors.request.use((config) => {
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (config.headers) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    error.normalized = error.normalized || normalizeApiError(error);

    if (
      error.response?.status !== 401 ||
      !refreshHandler ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest._skipRefresh ||
      shouldSkipRefresh(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const nextToken = await refreshHandler();

      if (!nextToken) {
        return Promise.reject(error);
      }

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${nextToken}`;

      return axiosClient(originalRequest);
    } catch (refreshError) {
      refreshError.normalized = refreshError.normalized || normalizeApiError(refreshError);
      return Promise.reject(refreshError);
    }
  }
);

export default axiosClient;
