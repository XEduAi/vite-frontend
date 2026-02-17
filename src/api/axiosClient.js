import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3000/api', // Đường dẫn đến Backend Fastify
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Tự động gắn Token vào header nếu có
axiosClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;