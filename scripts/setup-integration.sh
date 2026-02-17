#!/bin/bash

# BriefTube Platform - Supabase Integration Setup Script
# This script helps set up the integration between Platform and Supabase backend

set -e

echo "🚀 BriefTube Platform - Supabase Integration Setup"
echo "=================================================="
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local not found!"
    echo "Please copy .env-template to .env.local and configure it."
    exit 1
fi

# Check for Supabase credentials
if ! grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
    echo "❌ Error: Supabase URL not configured in .env.local"
    exit 1
fi

if ! grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
    echo "❌ Error: Supabase anon key not configured in .env.local"
    exit 1
fi

echo "✅ Environment configuration looks good"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
if command -v pnpm &> /dev/null; then
    echo "Using pnpm..."
    pnpm install
elif command -v npm &> /dev/null; then
    echo "Using npm..."
    npm install --legacy-peer-deps
else
    echo "❌ Error: Neither pnpm nor npm found!"
    exit 1
fi

echo ""
echo "✅ Dependencies installed"
echo ""

# Check if Supabase is reachable
echo "🔗 Testing Supabase connection..."
SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d '=' -f2 | tr -d '"')

if curl -s --head --request GET "$SUPABASE_URL/rest/v1/" > /dev/null; then
    echo "✅ Supabase connection successful"
else
    echo "⚠️  Warning: Could not reach Supabase. Check your connection."
fi

echo ""
echo "=================================================="
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Configure remaining .env.local variables (Database, Redis, Auth)"
echo "  2. Run: npm run dev"
echo "  3. Navigate to: http://localhost:3000/orgs/[your-org]/youtube"
echo ""
echo "📖 Documentation: ./INTEGRATION-SUPABASE.md"
echo "=================================================="
