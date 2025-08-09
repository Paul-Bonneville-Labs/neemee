#!/bin/bash
# Complete Development Setup for Neemee Frontend
# This script handles all prerequisites for local development

set -e

echo "🚀 Setting up Neemee frontend for local development..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        echo "📝 Creating .env.local from .env.example..."
        cp .env.example .env.local
        echo "⚠️  Please edit .env.local with your actual OAuth credentials"
    else
        echo "❌ No .env.local or .env.example found. Please create .env.local first."
        exit 1
    fi
fi

# Start database if not already running
echo "🐘 Ensuring PostgreSQL database is running..."
if ! docker exec neemee-local-postgres pg_isready -U neemee_user -d neemee > /dev/null 2>&1; then
    echo "📦 Starting PostgreSQL container..."
    docker-compose -f docker-compose.local.yml up -d
    
    # Wait for database to be ready
    echo "⏳ Waiting for database to be ready..."
    WAIT_TIME=0
    MAX_WAIT=60
    until docker exec neemee-local-postgres pg_isready -U neemee_user -d neemee > /dev/null 2>&1; do
        sleep 2
        WAIT_TIME=$((WAIT_TIME + 2))
        if [ $WAIT_TIME -ge $MAX_WAIT ]; then
            echo "❌ Database failed to start within ${MAX_WAIT} seconds"
            echo "📋 Check logs: docker logs neemee-local-postgres"
            exit 1
        fi
    done
    echo "✅ PostgreSQL database is ready!"
else
    echo "✅ PostgreSQL database is already running"
fi

# Install dependencies if node_modules doesn't exist or package.json is newer
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    echo "📦 Installing/updating dependencies..."
    npm install
else
    echo "✅ Dependencies are up to date"
fi

# Load environment variables for Prisma commands
export $(grep -v '^#' .env.local | xargs)

# Generate Prisma client if needed
echo "🔧 Generating Prisma client..."
npx prisma generate

# Check if database needs migrations
echo "🗄️  Checking database schema..."
if ! npx prisma db push --accept-data-loss --skip-generate > /dev/null 2>&1; then
    echo "📝 Running database migrations..."
    npx prisma migrate dev --name auto-migration
else
    echo "✅ Database schema is up to date"
fi

echo ""
echo "🎉 Development environment is ready!"
echo "🔗 Database: postgresql://neemee_user:local_dev_password@localhost:5433/neemee"
echo "🌐 Starting development server..."
echo ""