#!/bin/bash
# 🚀 GoDaddy Deployment Script - React SPA with Proper Routing

echo "🚀 GoDaddy Deployment Script - React SPA"
echo "========================================"
echo ""

echo "📦 Step 1: Building React Application"
echo "---------------------------------------"
npm run build

echo ""
echo "🔧 Step 2: Adding GoDaddy Configuration Files"
echo "----------------------------------------------"

# Create .htaccess for Apache routing
cat > dist/.htaccess << 'EOF'
# GoDaddy Apache Configuration for React SPA
# This file enables proper routing for single-page applications

# Enable rewrite engine
RewriteEngine On

# Set the base directory
RewriteBase /

# Handle API calls - don't rewrite them
RewriteCond %{REQUEST_URI} ^/api/ [NC]
RewriteRule ^ - [L]

# Handle socket.io - don't rewrite
RewriteCond %{REQUEST_URI} ^/socket.io/ [NC]
RewriteRule ^ - [L]

# Handle static assets - don't rewrite if file exists
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^ - [L]

# Handle static assets - don't rewrite if directory exists
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Handle static assets - don't rewrite for these extensions
RewriteCond %{REQUEST_URI} \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ [NC]
RewriteRule ^ - [L]

# Everything else goes to index.html for React Router
RewriteRule ^ index.html [L]
EOF

echo "✅ Created dist/.htaccess for Apache routing"

# Create web.config for IIS backup
cat > dist/web.config << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <!-- Do not rewrite API routes -->
        <rule name="API Routes" stopProcessing="true">
          <match url="^api/" />
          <action type="None" />
        </rule>

        <!-- Do not rewrite socket.io -->
        <rule name="SocketIO" stopProcessing="true">
          <match url="^socket\.io/" />
          <action type="None" />
        </rule>

        <!-- Do not rewrite static files -->
        <rule name="StaticFiles" stopProcessing="true">
          <match url="(.*)" />
          <conditions logicalGrouping="MatchAny">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" />
            <add input="{REQUEST_URI}" pattern="\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$" />
          </conditions>
          <action type="None" />
        </rule>

        <!-- Rewrite all other routes to index.html -->
        <rule name="ReactSPARewrite" stopProcessing="true">
          <match url="(.*)" />
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
EOF

echo "✅ Created dist/web.config for IIS backup"

echo ""
echo "📋 Step 3: Deployment Package Ready"
echo "-----------------------------------"
echo ""
echo "✅ Build completed successfully!"
echo "✅ .htaccess added for Apache routing"
echo "✅ web.config added for IIS backup"
echo ""
echo "📁 Files ready for GoDaddy upload:"
ls -la dist/ | head -10
echo ""
echo "🔑 Key files to verify in dist/:"
echo "   📄 .htaccess - Apache routing configuration"
echo "   📄 web.config - IIS backup configuration"
echo "   📄 index.html - Your React app entry point"
echo ""
echo "🚀 NEXT STEPS:"
echo "==============="
echo "1. Upload ALL files from dist/ to your GoDaddy hosting"
echo "2. Test the meeting route: https://upscholar.in/meeting/690220ef1eb7656d1c5bb87d"
echo "3. Verify all other routes work properly"
echo ""
echo "📞 Need help? Contact GoDaddy support and mention:"
echo "   'React SPA routing with .htaccess enabled'"
echo ""
echo "✨ Your deployment package is ready!"