# 🚨 GoDaddy .htaccess Troubleshooting Guide

## 🔍 Step 1: Verify .htaccess Location

**Correct Location:**
```
public_html/
├── .htaccess          ← MUST be here (same folder as index.html)
├── index.html
└── assets/
```

**Wrong Location:**
```
public_html/
├── .htaccess          ← WRONG: Don't put in subfolder
├── index.html
└── assets/
    └── .htaccess      ← WRONG: Not here
```

## 🔍 Step 2: Check File Permissions

**In GoDaddy File Manager:**
1. Right-click on `.htaccess`
2. Click "Change Permissions"
3. **Should be:** 644 (Owner: Read/Write, Group: Read, World: Read)
4. **Click "Change Permissions"**

## 🔍 Step 3: Test if .htaccess is Working

**Create a test file:** Upload this as `test-htaccess.php`:
```php
<?php
phpinfo();
?>
```

**Visit:** `https://upscholar.in/test-htaccess.php`

**Look for:** "mod_rewrite" - if you see it, mod_rewrite is enabled

## 🔍 Step 4: Try Different .htaccess Configurations

### **Option A: Minimal Configuration**
```apache
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [L]
```

### **Option B: With Error Document**
```apache
RewriteEngine On
RewriteBase /
ErrorDocument 404 /index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [L]
```

### **Option C: Force HTTPS + SPA**
```apache
RewriteEngine On
RewriteBase /

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

# SPA Routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [L]
```

## 🔍 Step 5: Check GoDaddy Hosting Type

**Contact GoDaddy Support and ask:**
1. "Is my hosting Apache or IIS?"
2. "Is mod_rewrite enabled?"
3. "Do you support .htaccess files?"

**If IIS (Windows hosting):** Use `web.config` instead:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <rule name="React Router" stopProcessing="true">
                    <match url=".*" />
                    <conditions logicalGrouping="MatchAll">
                        <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
                        <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
                    </conditions>
                    <action type="Rewrite" url="/index.html" />
                </rule>
            </rules>
        </rewrite>
    </system.webServer>
</configuration>
```

## 🔍 Step 6: Clear All Caches

**Clear everything:**
1. **Browser cache:** Ctrl+Shift+R (hard refresh)
2. **GoDaddy cache:** Contact support to clear server cache
3. **CDN cache:** If using CloudFlare, purge cache

## 🔍 Step 7: Test with Simple URL

**Test these URLs:**
- `https://upscholar.in/meeting/test123`
- `https://upscholar.in/dashboard`
- `https://upscholar.in/login`

**If homepage works but routes don't:** .htaccess issue confirmed

## 🆘 Emergency Contact GoDaddy

**Call GoDaddy Support:** 1-480-505-8877
**Say exactly:** "My React app routes return 404. I need mod_rewrite enabled and .htaccess support for single-page application routing."

## 📁 Files to Test Upload

**Upload these test files:**
1. `test-htaccess.php` (to check mod_rewrite)
2. `.htaccess` (try the minimal version first)
3. `web.config` (if Windows hosting)

**Test order:**
1. Upload minimal .htaccess
2. Test a route like `/login`
3. If still 404, try web.config
4. Contact GoDaddy support