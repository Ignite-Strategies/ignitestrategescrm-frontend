import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.PROD 
    ? 'https://eventscrm-backend.onrender.com/api' 
    : '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add Gmail access token and adminId to requests
api.interceptors.request.use(request => {
  // Only add Gmail token to Gmail-related routes
  const isGmailRoute = request.url.includes('/email/') || request.url.includes('/enterprise-gmail/');
  
  if (isGmailRoute) {
    const gmailAccessToken = localStorage.getItem('gmailAccessToken');
    if (gmailAccessToken) {
      request.headers.Authorization = `Bearer ${gmailAccessToken}`;
      console.log('🔑 Adding Gmail token to request:', {
        url: request.url,
        tokenStart: gmailAccessToken.substring(0, 20) + '...',
        tokenLength: gmailAccessToken.length,
        authHeader: request.headers.Authorization.substring(0, 30) + '...'
      });
    } else {
      console.warn('⚠️ No Gmail token found for Gmail route:', request.url);
    }
  }
  
  const adminId = localStorage.getItem('adminId');
  if (adminId) {
    request.headers['x-admin-id'] = adminId;
  }
  
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
    
    // 🚨 GMAIL TOKEN EXPIRATION DETECTION
    if (error.response?.status === 401 && error.config?.url?.includes('/enterprise-gmail/')) {
      console.log('🔑 Gmail token expired (401 on Gmail route)');
      
      // Clear expired token
      localStorage.removeItem('gmailAccessToken');
      localStorage.removeItem('gmailEmail');
      localStorage.removeItem('gmailTokenTimestamp');
      
      // Show user-friendly message and redirect
      const shouldRedirect = window.confirm(
        '🚨 Gmail authentication expired!\n\n' +
        'Your Gmail connection has timed out (tokens expire after 1 hour).\n\n' +
        'Click OK to reconnect now, or Cancel to stay on this page.'
      );
      
      if (shouldRedirect) {
        // Store where they were trying to go
        localStorage.setItem('redirectMessage', 'Gmail authentication expired. Please reconnect below.');
        // Redirect to campaign home to reconnect
        window.location.href = '/campaignhome';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

