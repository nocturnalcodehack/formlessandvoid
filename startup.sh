#!/bin/bash

echo "🚀 Starting Formless and Void Survey Platform"
echo "=============================================="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚙️  Creating .env.local from template..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your database credentials!"
    exit 1
fi

# Check if PostgreSQL is running (basic check)
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL client not found. Please ensure PostgreSQL is installed."
fi

echo ""
echo "📊 Database setup:"
echo "1. Make sure PostgreSQL is running"
echo "2. Create database: CREATE DATABASE formlessandvoid;"
echo "3. Run: npm run db:init (to initialize tables)"
echo "4. Run: npm run db:seed (to add sample data - optional)"
echo ""
echo "Starting development server..."
npm run dev
