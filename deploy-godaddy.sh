#!/bin/bash
# 🎨 UpScholar Frontend Deployment Script for GoDaddy
# Domain: upscholar.in

set -e  # Exit on error

echo "🎨 UpScholar Frontend Deployment Script"
echo "====================================="
echo "Domain: upscholar.in"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
BUILD_DIR="dist"
PROJECT_NAME="upscholar-frontend"

# Step 1: Check if we're in the client directory
if [ ! -f "package.json" ] || [ ! -f "vite.config.ts" ]; then
    echo -e "${RED}❌ Error: Please run this script from the client directory!${NC}"
    exit 1
fi

# Step 2: Check Node.js
echo -e "${GREEN}📦 Step 1: Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi
echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Step 3: Install dependencies
echo -e "${GREEN}📦 Step 2: Installing dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
else
    echo "Dependencies already installed. Updating..."
    npm install
fi

# Step 4: Clean previous build
echo -e "${GREEN}🧹 Step 3: Cleaning previous build...${NC}"
if [ -d "$BUILD_DIR" ]; then
    rm -rf "$BUILD_DIR"
    echo "✅ Previous build removed"
fi

# Step 5: Build for production
echo -e "${GREEN}🔨 Step 4: Building for production...${NC}"
echo "Building with production environment variables..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed! Please check the error messages above.${NC}"
    exit 1
fi

# Step 6: Verify build
echo -e "${GREEN}✅ Step 5: Verifying build...${NC}"
if [ ! -f "$BUILD_DIR/index.html" ]; then
    echo -e "${RED}❌ Build failed: index.html not found!${NC}"
    exit 1
fi

echo "✅ Build successful!"
echo "   - Build directory: $(pwd)/$BUILD_DIR"
echo "   - Files: $(find $BUILD_DIR -type f | wc -l) files"

# Step 7: Create .htaccess file for React Router
echo -e "${GREEN}📝 Step 6: Creating .htaccess file...${NC}"
cat > "$BUILD_DIR/.htaccess" << 'EOF'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-Content-Type-Options "nosniff"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Enable Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json application/xml
</IfModule>

# Cache Control
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/pdf "access plus 1 month"
</IfModule>
EOF
echo "✅ .htaccess file created"

# Step 8: Create deployment package (optional)
echo -e "${GREEN}📦 Step 7: Creating deployment package...${NC}"
cd "$BUILD_DIR"
zip -r "../${PROJECT_NAME}-deploy.zip" . -q
cd ..
echo "✅ Deployment package created: ${PROJECT_NAME}-deploy.zip"

# Step 9: Display file list
echo ""
echo -e "${GREEN}📁 Step 8: Build contents:${NC}"
echo "Files in $BUILD_DIR:"
ls -lh "$BUILD_DIR" | head -20
echo ""

# Step 10: Display deployment instructions
echo "====================================="
echo -e "${GREEN}✅ Build Complete!${NC}"
echo "====================================="
echo ""
echo "📋 Next Steps for GoDaddy Deployment:"
echo ""
echo "Option 1: Using GoDaddy File Manager"
echo "  1. Log in to GoDaddy"
echo "  2. Go to My Products → Web Hosting → Manage"
echo "  3. Click File Manager"
echo "  4. Navigate to public_html (or your domain root)"
echo "  5. Delete all existing files (backup first!)"
echo "  6. Upload ALL files from: $(pwd)/$BUILD_DIR"
echo "  7. Ensure index.html is in the root"
echo ""
echo "Option 2: Using FTP"
echo "  1. Connect to your GoDaddy FTP server"
echo "  2. Navigate to public_html/"
echo "  3. Upload all files from: $(pwd)/$BUILD_DIR"
echo ""
echo "Option 3: Using ZIP Upload"
echo "  1. Upload: $(pwd)/${PROJECT_NAME}-deploy.zip"
echo "  2. Extract in public_html/"
echo ""
echo "🔍 Verification Checklist:"
echo "  [ ] All files uploaded to public_html/"
echo "  [ ] .htaccess file is uploaded (important for routing!)"
echo "  [ ] index.html is in the root directory"
echo "  [ ] SSL certificate is configured"
echo "  [ ] Visit https://upscholar.in to test"
echo ""
echo "🌐 Configuration:"
echo "  - Frontend URL: https://upscholar.in"
echo "  - Backend API: https://api.upscholar.in"
echo ""
echo "🐛 Troubleshooting:"
echo "  - 404 errors on routes? → Check .htaccess file is uploaded"
echo "  - API errors? → Verify backend is running at api.upscholar.in"
echo "  - SSL issues? → Check GoDaddy SSL certificate status"
echo ""
echo "📦 Build Location:"
echo "  $(pwd)/$BUILD_DIR"
echo ""
echo "🚀 Ready for deployment!"
