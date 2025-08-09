#!/bin/bash
# Start Local PostgreSQL Database for Frontend Development

set -e

echo "🐘 Starting local PostgreSQL database for frontend development..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start the database container
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
echo "🔗 Connection string: postgresql://neemee_user:local_dev_password@localhost:5433/neemee"
echo "📊 View logs: docker logs neemee-local-postgres"
echo "🛠️  Connect directly: docker exec -it neemee-local-postgres psql -U neemee_user -d neemee"
echo ""
echo "Next steps:"
echo "1. Update your .env.local to use: DATABASE_URL=\"postgresql://neemee_user:local_dev_password@localhost:5433/neemee\""
echo "2. Run: npm run db:generate && npm run db:migrate"
echo "3. Start frontend: npm run dev"