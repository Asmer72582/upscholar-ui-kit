/**
 * Environment Configuration - EMERGENCY WORKAROUND
 * Temporary solution for mixed content error while SSL is being set up
 * This uses HTTP temporarily to bypass mixed content blocking
 */

// Get environment variables from Vite
const getEnvVar = (key: string, defaultValue: string): string => {
  return import.meta.env[key] || defaultValue;
};

// EMERGENCY WORKAROUND: Use HTTP temporarily to avoid mixed content errors
// WARNING: This is not secure - only use while setting up SSL
export const API_CONFIG = {
  // Backend API Base URL - Temporary HTTP workaround
  BASE_URL: getEnvVar('VITE_API_BASE_URL', 'http://13.60.254.183:3000'),
  
  // API Endpoints
  API_URL: getEnvVar('VITE_API_BASE_URL', 'http://13.60.254.183:3000') + '/api',
  
  // Socket.io URL - Temporary HTTP workaround
  SOCKET_URL: getEnvVar('VITE_SOCKET_URL', 'http://13.60.254.183:3000'),
  
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
  console.log('🔧 Environment Configuration (EMERGENCY WORKAROUND):', {
    API_BASE_URL,
    API_URL,
    SOCKET_URL,
    FRONTEND_URL,
    MODE: import.meta.env.MODE,
    WARNING: 'Using HTTP temporarily - SSL setup in progress',
  });
}