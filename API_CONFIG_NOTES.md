# API Configuration for UpScholar Frontend

This file contains the API configuration that will be used once SSL is set up.

## Current Configuration (HTTP)
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://13.60.254.183:3000',
  API_URL: 'http://13.60.254.183:3000/api',
  SOCKET_URL: 'http://13.60.254.183:3000',
  FRONTEND_URL: 'http://localhost:8080',
};
```

## Target Configuration (HTTPS)
Once SSL is set up on the backend, update to:
```typescript
export const API_CONFIG = {
  BASE_URL: 'https://api.upscholar.in',
  API_URL: 'https://api.upscholar.in/api',
  SOCKET_URL: 'https://api.upscholar.in',
  FRONTEND_URL: 'https://upscholar.in',
};
```

## Steps to Enable HTTPS

1. **Set up DNS**: Point `api.upscholar.in` to `13.60.254.183`
2. **Run SSL Setup**: Execute `./setup-ssl.sh api.upscholar.in` on EC2
3. **Update Environment**: Change all HTTP URLs to HTTPS
4. **Test**: Verify `https://api.upscholar.in/health` works
5. **Deploy**: Push changes and verify mixed content error is resolved

## Socket.IO Configuration

For HTTPS, Socket.IO will automatically use secure WebSocket (wss://) when connecting via HTTPS.

## Environment Files to Update

- `.env` - Development environment
- `.env.production` - Production environment (Vercel)
- `.env.example` - Template for new developers
- `src/config/env.ts` - Runtime configuration

## Mixed Content Resolution

The mixed content error occurs when:
- Frontend is served over HTTPS (`https://upscholar.in`)
- Backend API calls use HTTP (`http://13.60.254.183:3000`)

Solution: Use HTTPS for both frontend and backend.