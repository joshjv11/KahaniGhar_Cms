#!/bin/bash

# Kahani Ghar CMS - Run Script
# This script sets up and runs the development server

set -e  # Exit on error

echo "🚀 Starting Kahani Ghar CMS..."

# Check if node_modules exists, install if not
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  WARNING: .env.local file not found!"
    echo "   Please create .env.local with:"
    echo "   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
    echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"
    echo ""
    echo "   Continuing anyway..."
else
    echo "✅ Environment variables found"
fi

echo ""
echo "🌐 Starting development server..."
echo "   The app will be available at http://localhost:3000"
echo ""

# Run the development server
npm run dev
