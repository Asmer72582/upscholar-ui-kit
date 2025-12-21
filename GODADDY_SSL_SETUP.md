# 🚀 GoDaddy Production SSL Setup Guide

## Problem Solved
The mixed content error occurs because:
- Frontend: `https://upscholar.in` (HTTPS)
- Backend: `http://13.60.254.183:3000` (HTTP)
- **HTTPS pages cannot load HTTP resources** (browser security)

## ✅ Immediate Solution

### Step 1: Set up DNS (GoDaddy)
1. **Log into GoDaddy DNS Management**
2. **Add A Record:**
   ```
   Type: A Record
   Name: api
   Value: 13.60.254.183
   TTL: 600 (10 minutes)
   ```
3. **Wait for propagation** (5-10 minutes)

### Step 2: Set up SSL on EC2 (Run on your server)
```bash
# SSH into your EC2 instance
ssh ubuntu@13.60.254.183

# Navigate to backend directory
cd /path/to/upscholar-backend

# Run SSL setup script
sudo ./setup-godaddy-ssl.sh api.upscholar.in
```

### Step 3: Deploy Updated Frontend
```bash
# On your local machine
cd /Users/asmerchougle/Documents/upwork/upscholar-ui-kit

# Build for production
npm run build

# Deploy to GoDaddy (or your hosting)
# Copy dist/ folder to your GoDaddy hosting
```

### Step 4: Verify Everything Works
```bash
# Test HTTPS endpoint
curl https://api.upscholar.in/health

# Test auth endpoint
curl -X POST https://api.upscholar.in/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test CORS
curl -H "Origin: https://upscholar.in" https://api.upscholar.in/health
```

## 🔧 Files Updated

1. **`/Users/asmerchougle/Documents/upwork/upscholar-ui-kit/src/config/env.ts`**
   - Updated to use `https://api.upscholar.in`
   - Socket.IO now uses secure WebSocket

2. **`/Users/asmerchougle/Documents/upwork/upscholar-ui-kit/.env`**
   - Development environment uses HTTPS

3. **`/Users/asmerchougle/Documents/upwork/upscholar-ui-kit/.env.production`**
   - Production environment uses HTTPS

4. **`/Users/asmerchougle/Documents/upwork/upscholar-backend/setup-godaddy-ssl.sh`**
   - Automated SSL setup script

## 📋 Backend Routes Verified

✅ `/api/auth/login` - POST (exists at line 258 in auth.js)
✅ `/api/auth/register` - POST 
✅ `/api/health` - GET (health check)
✅ All routes properly registered in `/routes/index.js`

## 🎯 Expected Results After Setup

1. **No more mixed content errors**
2. **Secure HTTPS connections**
3. **Working auth endpoints**
4. **Proper CORS handling**

## ⚡ Quick Test Commands

```bash
# After DNS setup, test these URLs:
https://api.upscholar.in/health
https://api.upscholar.in/api/auth/login

# Check SSL certificate:
openssl s_client -connect api.upscholar.in:443 -servername api.upscholar.in
```

## 🚨 Common Issues & Fixes

### Issue: "Domain not resolving"
- **Fix:** Wait 10-15 minutes for DNS propagation
- **Check:** `nslookup api.upscholar.in`

### Issue: "SSL certificate failed"
- **Fix:** Ensure port 80 is open in AWS security groups
- **Fix:** Domain must point to your EC2 IP

### Issue: "CORS errors still occur"
- **Fix:** Backend CORS already configured for `https://upscholar.in`
- **Check:** Browser developer console for specific errors

## 📞 Support

If you encounter issues:
1. Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
2. Check certbot logs: `sudo tail -f /var/log/letsencrypt/letsencrypt.log`
3. Test with curl commands above
4. Verify DNS propagation

## 🎉 Success Indicators

✅ No more mixed content errors in browser console
✅ `https://upscholar.in/auth` loads without errors
✅ Auth API calls use `https://api.upscholar.in/api/auth/login`
✅ Green lock icon in browser address bar