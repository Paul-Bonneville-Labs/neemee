#!/bin/bash
# Stop Local PostgreSQL Database

set -e

echo "🛑 Stopping local PostgreSQL database..."

# Stop and remove containers
docker-compose -f docker-compose.local.yml down

echo "✅ PostgreSQL database stopped successfully!"
echo "💾 Data is preserved in Docker volume 'neemee_local_postgres_data'"
echo "🔄 To start again: ./scripts/db-start.sh"