import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.PROD 
    ? 'https://eventscrm-backend.onrender.com/api' 
    : '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Log API calls for debugging
api.interceptors.request.use(request => {
  console.log('API Request:', request.method.toUpperCase(), request.url, request.data);
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  error => {
    console.error('API Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;

