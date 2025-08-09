#!/bin/bash
# Reset Local PostgreSQL Database to Clean State

set -e

echo "🔄 Resetting local PostgreSQL database to clean state..."
echo "⚠️  WARNING: This will DELETE ALL local database data!"
echo ""

# Prompt for confirmation
read -p "Are you sure you want to reset the local database? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Reset cancelled"
    exit 0
fi

echo "🛑 Stopping containers..."
docker-compose -f docker-compose.local.yml down

echo "🗑️  Removing database volume..."
docker volume rm neemee_local_postgres_data 2>/dev/null || echo "Volume already removed or doesn't exist"

echo "📦 Starting fresh database..."
docker-compose -f docker-compose.local.yml up -d

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

echo "✅ Database reset complete!"
echo "🔗 Connection string: postgresql://neemee_user:local_dev_password@localhost:5432/neemee"
echo ""
echo "Next steps:"
echo "1. Run: npm run db:generate && npm run db:migrate"
echo "2. Optionally seed data: npm run db:seed (if you have seed scripts)"
echo "3. Start frontend: npm run dev"