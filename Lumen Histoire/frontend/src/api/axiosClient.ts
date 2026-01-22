import axios from 'axios';

// For Vite, environment variables are accessed via import.meta.env
// Ensure you have REACT_APP_API_BASE_URL defined in a .env file at the root of your frontend project
// e.g., VITE_API_BASE_URL=http://localhost:3001/api
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add a request interceptor for things like adding auth tokens
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor for global error handling
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors globally (e.g., redirect to login on 401)
    // if (error.response && error.response.status === 401) {
    //   // Handle unauthorized access
    //   // Example: window.location.href = '/login';
    // }
    return Promise.reject(error);
  }
);

export default axiosClient; 