#!/bin/bash

# E-Cell Attendance System - Setup Verification Script
# This script checks if your Supabase database and storage are properly configured

echo "================================================="
echo "E-Cell Attendance System - Setup Verification"
echo "================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
echo "Checking environment configuration..."
if [ ! -f .env.local ]; then
    echo -e "${RED}✗ .env.local file not found${NC}"
    echo "  Please copy .env.example to .env.local and configure it"
    exit 1
else
    echo -e "${GREEN}✓ .env.local file exists${NC}"
fi

# Check if required env variables are set (not default values)
if grep -q "your-supabase-url" .env.local; then
    echo -e "${YELLOW}⚠ .env.local contains placeholder values${NC}"
    echo "  Please update with your actual Supabase credentials"
else
    echo -e "${GREEN}✓ Environment variables configured${NC}"
fi

echo ""
echo "Checking Node.js and dependencies..."

# Check Node.js version
NODE_VERSION=$(node -v 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not installed${NC}"
    exit 1
fi

# Check if node_modules exists
if [ -d node_modules ]; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ Dependencies not installed${NC}"
    echo "  Run: npm install"
fi

echo ""
echo "================================================="
echo "Supabase Configuration Check"
echo "================================================="
echo ""
echo "To verify your Supabase setup:"
echo ""
echo "1. Start the development server:"
echo "   npm run dev"
echo ""
echo "2. Open these URLs in your browser:"
echo "   • Database Health: http://localhost:3000/api/health/database"
echo "   • Storage Health:  http://localhost:3000/api/health/storage"
echo ""
echo "3. Expected response:"
echo '   {"status": "healthy", ...}'
echo ""
echo "4. If any checks fail, see SUPABASE_CHECKLIST.md for troubleshooting"
echo ""
echo "================================================="
echo "Quick Setup Checklist"
echo "================================================="
echo ""
echo "□ Supabase project created"
echo "□ schema.sql executed in Supabase SQL Editor"
echo "□ Environment variables configured in .env.local"
echo "□ Development server running (npm run dev)"
echo "□ Health checks passing"
echo "□ First admin user created"
echo ""
echo "For detailed setup instructions, see SETUP.md"
echo ""
