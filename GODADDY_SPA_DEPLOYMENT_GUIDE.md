# 🚀 GoDaddy Deployment Guide - React SPA with API Integration

## 📋 Problem Solved
The 404 error on routes like `https://upscholar.in/meeting/690220ef1eb7656d1c5bb87d` occurs because GoDaddy's Apache server looks for physical files instead of letting your React SPA handle routing.

## ✅ Solution Files Created

### 1. `.htaccess` - Apache Configuration
- **Purpose**: Enables proper routing for single-page applications
- **Location**: `dist/.htaccess`
- **Function**: Redirects all routes to `index.html` while preserving API calls

### 2. `web.config` - IIS Configuration (Backup)
- **Purpose**: Alternative configuration for Windows servers
- **Location**: `dist/web.config`
- **Function**: Same as .htaccess but for IIS servers

## 📁 Deployment Steps

### Step 1: Upload Files to GoDaddy
1. **Connect to GoDaddy hosting** via FTP or File Manager
2. **Upload the entire `dist/` folder** contents to your web root
3. **Ensure `.htaccess` is uploaded** (hidden files may need special attention)

### Step 2: Verify File Structure
Your GoDaddy web root should look like:
```
public_html/
├── .htaccess          ← IMPORTANT: This enables SPA routing
├── web.config         ← Backup configuration
├── index.html         ← Your React app entry point
├── favicon.ico
├── robots.txt
├── assets/            ← Static assets
└── uploads/           ← If applicable
```

### Step 3: Test Routes
After deployment, test these URLs:
- ✅ `https://upscholar.in/` - Should load the app
- ✅ `https://upscholar.in/auth` - Should load auth page
- ✅ `https://upscholar.in/meeting/690220ef1eb7656d1c5bb87d` - Should load meeting page
- ✅ `https://upscholar.in/dashboard` - Should load dashboard

## 🔧 Configuration Details

### What .htaccess Does
```apache
# Handle API calls - don't rewrite them
RewriteCond %{REQUEST_URI} ^/api/ [NC]
RewriteRule ^ - [L]

# Handle socket.io - don't rewrite
RewriteCond %{REQUEST_URI} ^/socket.io/ [NC]
RewriteRule ^ - [L]

# Handle static assets - don't rewrite if file exists
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^ - [L]

# Everything else goes to index.html for React Router
RewriteRule ^ index.html [L]
```

### Key Features
- **Preserves API calls**: `/api/*` routes go to backend
- **Preserves WebSocket**: `/socket.io/*` routes work
- **Preserves static files**: CSS, JS, images load normally
- **SPA routing**: All other routes serve `index.html`

## 🧪 Testing Commands

### Test Your Deployment
```bash
# Test main route
curl -I https://upscholar.in/

# Test meeting route (should return 200 OK)
curl -I https://upscholar.in/meeting/690220ef1eb7656d1c5bb87d

# Test API still works
curl -I https://api.upscholar.in/health

# Test auth endpoint
curl -X POST https://api.upscholar.in/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@test.com","password":"test"}'
```

## 🚨 Common Issues & Solutions

### Issue 1: .htaccess not working
**Solution**: Contact GoDaddy support to ensure Apache mod_rewrite is enabled

### Issue 2: 500 Internal Server Error
**Solution**: Check .htaccess syntax and file permissions

### Issue 3: API calls being rewritten
**Solution**: Verify .htaccess is uploaded correctly and API routes are excluded

### Issue 4: Static assets not loading
**Solution**: Check file paths and ensure assets folder is uploaded

## 📞 GoDaddy Support
If you need help:
1. **Contact GoDaddy support** and mention "React SPA routing with .htaccess"
2. **Reference**: You need Apache mod_rewrite enabled for single-page application routing
3. **Alternative**: Ask them to configure "Fallback to index.html" for your domain

## ✅ Success Criteria
After deployment, you should have:
- [ ] No 404 errors on React routes
- [ ] Meeting URLs load correctly
- [ ] API calls still work
- [ ] WebSocket connections work
- [ ] Static assets load properly

## 🎯 Next Steps
1. Upload files to GoDaddy
2. Test the meeting route: `https://upscholar.in/meeting/690220ef1eb7656d1c5bb87d`
3. Verify all other routes work
4. Test API integration

Your React SPA should now work perfectly on GoDaddy with proper routing! 🎉