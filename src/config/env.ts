/**
 * Environment Configuration - HTTPS SECURE VERSION
 * Now using https://api.upscholar.in for all API calls
 * ✅ SSL is working - using secure HTTPS endpoints
 */

// Get environment variables from Vite
const getEnvVar = (key: string, defaultValue: string): string => {
  return import.meta.env[key] || defaultValue;
};

// SECURE HTTPS CONFIGURATION - api.upscholar.in is now working!
export const API_CONFIG = {
  // Backend API Base URL - Now using HTTPS!
  BASE_URL: getEnvVar('VITE_API_BASE_URL', 'https://api.upscholar.in'),
  
  // API Endpoints
  API_URL: getEnvVar('VITE_API_BASE_URL', 'https://api.upscholar.in') + '/api',
  
  // Socket.io URL - Now using secure WebSocket!
  SOCKET_URL: getEnvVar('VITE_SOCKET_URL', 'https://api.upscholar.in'),
  
  // Frontend URL
  FRONTEND_URL: getEnvVar('VITE_FRONTEND_URL', 'https://upscholar.in'),
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'Upscholar',
  APP_VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@upscholar.com',
};

// GetStream.io Video Configuration
export const STREAM_CONFIG = {
  // API Key is fetched from backend for security
  // The backend generates tokens with the secret key
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
  console.log('🔧 Environment Configuration (HTTPS SECURE):', {
    API_BASE_URL,
    API_URL,
    SOCKET_URL,
    FRONTEND_URL,
    MODE: import.meta.env.MODE,
    STATUS: '✅ Using HTTPS - SSL is working!',
  });
}