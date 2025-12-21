/**
 * Environment Configuration
 * Centralized configuration for API URLs and environment variables
 * UPDATED: For GoDaddy Production SSL Setup
 */

// Get environment variables from Vite
const getEnvVar = (key: string, defaultValue: string): string => {
  return import.meta.env[key] || defaultValue;
};

// API Configuration - UPDATED FOR HTTPS
export const API_CONFIG = {
  // Backend API Base URL - Use HTTPS for production to avoid mixed content
  BASE_URL: getEnvVar('VITE_API_BASE_URL', 'https://api.upscholar.in'),
  
  // API Endpoints
  API_URL: getEnvVar('VITE_API_BASE_URL', 'https://api.upscholar.in') + '/api',
  
  // Socket.io URL - Use secure WebSocket for production
  SOCKET_URL: getEnvVar('VITE_SOCKET_URL', 'https://api.upscholar.in'),
  
  // Frontend URL
  FRONTEND_URL: getEnvVar('VITE_FRONTEND_URL', 'https://upscholar.in'),
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'UpScholar',
  APP_VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@upscholar.com',
};

// Feature Flags
export const FEATURES = {
  ENABLE_MEETINGS: true,
  ENABLE_WHITEBOARD: true,
  ENABLE_SCREEN_SHARE: true,
  ENABLE_CHAT: true,
};

// Export individual values for convenience
export const API_BASE_URL = API_CONFIG.BASE_URL;
export const API_URL = API_CONFIG.API_URL;
export const SOCKET_URL = API_CONFIG.SOCKET_URL;
export const FRONTEND_URL = API_CONFIG.FRONTEND_URL;

// Log configuration in development
if (import.meta.env.DEV) {
  console.log('🔧 Environment Configuration:', {
    API_BASE_URL,
    API_URL,
    SOCKET_URL,
    FRONTEND_URL,
    MODE: import.meta.env.MODE,
  });
}