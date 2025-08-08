#!/bin/bash

# Setup Staging Cloud SQL Database Script
set -e

echo "Setting up staging Cloud SQL database..."

# Wait for instance to be ready
echo "Waiting for neemee-postgres-staging instance to be ready..."
gcloud sql instances describe neemee-postgres-staging --format="value(state)" | grep -q "RUNNABLE" || {
    echo "Waiting for instance to be created..."
    while ! gcloud sql instances describe neemee-postgres-staging --format="value(state)" | grep -q "RUNNABLE"; do
        echo "Instance still creating... waiting 30 seconds"
        sleep 30
    done
}

echo "Instance is ready! Creating staging database and user..."

# Create staging database
gcloud sql databases create neemee_staging --instance=neemee-postgres-staging

# Create staging user with password from environment or generate one
STAGING_DB_PASSWORD=${STAGING_DB_PASSWORD:-$(openssl rand -base64 32)}

gcloud sql users create neemee_user \
    --instance=neemee-postgres-staging \
    --password="$STAGING_DB_PASSWORD"

echo "✅ Staging database setup complete!"
echo "Database URL: postgresql://neemee_user:$STAGING_DB_PASSWORD@localhost:5433/neemee_staging"
echo ""
echo "🔑 Save this password for your staging environment configuration:"
echo "$STAGING_DB_PASSWORD"
echo ""
echo "Next steps:"
echo "1. Update .env.staging with the generated password"
echo "2. Create Cloud Secrets for staging environment"
echo "3. Deploy staging environment"