#!/bin/bash
# GoDaddy Production Deployment Script
# This script builds and prepares your frontend for GoDaddy deployment

echo "🚀 Building UpScholar Frontend for GoDaddy Production..."

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build for production
echo "🔨 Building for production..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo ""
    echo "📁 Build files are ready in the 'dist' folder:"
    echo "$(pwd)/dist/"
    echo ""
    echo "🚀 Next steps for GoDaddy deployment:"
    echo "1. Upload the contents of 'dist' folder to your GoDaddy hosting"
    echo "2. Ensure your GoDaddy domain points to the uploaded files"
    echo "3. Set up SSL on backend (see GODADDY_SSL_SETUP.md)"
    echo ""
    echo "📋 Files to upload to GoDaddy:"
    ls -la dist/
    echo ""
    echo "✨ Your frontend is now configured for HTTPS!"
    echo "   API URL: https://api.upscholar.in"
    echo "   Socket URL: https://api.upscholar.in"
else
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi