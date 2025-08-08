#!/bin/bash

# Cloud SQL PostgreSQL Setup Script for Neemee Frontend POC
# Optimized for cost-effective development and testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Neemee Cloud SQL Setup (POC Optimized)${NC}"
echo "=================================================="

# Load environment variables
if [ -f ".env.local" ]; then
    echo "Loading environment variables from .env.local..."
    export $(grep -v '^#' .env.local | xargs)
else
    echo -e "${YELLOW}⚠️  No .env.local file found. Using defaults or gcloud config.${NC}"
fi

# Configuration
PROJECT_ID=${PROJECT_ID:-$(gcloud config get-value project 2>/dev/null)}
REGION=${REGION:-us-central1}
INSTANCE_NAME=${INSTANCE_NAME:-neemee-postgres-poc}
DATABASE_NAME=${DATABASE_NAME:-neemee}
DATABASE_USER=${DATABASE_USER:-neemee_user}

if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ No Google Cloud project set. Please run: gcloud config set project YOUR_PROJECT_ID${NC}"
    exit 1
fi

echo -e "${GREEN}📦 Using project: ${PROJECT_ID}${NC}"
echo -e "${GREEN}🌍 Using region: ${REGION}${NC}"
echo -e "${GREEN}💾 Database instance: ${INSTANCE_NAME}${NC}"

# Enable required APIs
echo -e "${YELLOW}Step 1: Enabling required APIs...${NC}"
apis=(
    "sqladmin.googleapis.com"
    "secretmanager.googleapis.com"
    "compute.googleapis.com"
)

for api in "${apis[@]}"; do
    echo "Enabling $api..."
    gcloud services enable "$api" --project="$PROJECT_ID"
done

echo -e "${GREEN}✅ APIs enabled${NC}"

# Create Cloud SQL instance (POC optimized)
echo -e "${YELLOW}Step 2: Creating Cloud SQL instance...${NC}"

if ! gcloud sql instances describe "$INSTANCE_NAME" --project="$PROJECT_ID" &>/dev/null; then
    echo "Creating PostgreSQL instance (this may take several minutes)..."
    gcloud sql instances create "$INSTANCE_NAME" \
        --database-version=POSTGRES_14 \
        --tier=db-f1-micro \
        --storage-size=10GB \
        --storage-type=SSD \
        --storage-auto-increase \
        --region="$REGION" \
        --availability-type=zonal \
        --backup-start-time=05:00 \
        --maintenance-window-day=SUN \
        --maintenance-window-hour=6 \
        --project="$PROJECT_ID"
    
    echo -e "${GREEN}✅ Cloud SQL instance created: $INSTANCE_NAME${NC}"
else
    echo -e "${YELLOW}ℹ️  Cloud SQL instance already exists: $INSTANCE_NAME${NC}"
fi

# Generate secure password
DB_PASSWORD=$(openssl rand -base64 32)

# Create database user
echo -e "${YELLOW}Step 3: Creating database user...${NC}"
if ! gcloud sql users describe "$DATABASE_USER" --instance="$INSTANCE_NAME" --project="$PROJECT_ID" &>/dev/null; then
    gcloud sql users create "$DATABASE_USER" \
        --instance="$INSTANCE_NAME" \
        --password="$DB_PASSWORD" \
        --project="$PROJECT_ID"
    echo -e "${GREEN}✅ Database user created: $DATABASE_USER${NC}"
else
    echo -e "${YELLOW}ℹ️  Database user already exists: $DATABASE_USER${NC}"
fi

# Create database
echo -e "${YELLOW}Step 4: Creating database...${NC}"
if ! gcloud sql databases describe "$DATABASE_NAME" --instance="$INSTANCE_NAME" --project="$PROJECT_ID" &>/dev/null; then
    gcloud sql databases create "$DATABASE_NAME" \
        --instance="$INSTANCE_NAME" \
        --project="$PROJECT_ID"
    echo -e "${GREEN}✅ Database created: $DATABASE_NAME${NC}"
else
    echo -e "${YELLOW}ℹ️  Database already exists: $DATABASE_NAME${NC}"
fi

# Store credentials in Secret Manager
echo -e "${YELLOW}Step 5: Storing credentials in Secret Manager...${NC}"

# Database connection string
CONNECTION_STRING="postgresql://${DATABASE_USER}:${DB_PASSWORD}@localhost:5432/${DATABASE_NAME}?host=/cloudsql/${PROJECT_ID}:${REGION}:${INSTANCE_NAME}"

# Store secrets
secrets=(
    "neemee-db-host:${PROJECT_ID}:${REGION}:${INSTANCE_NAME}"
    "neemee-db-name:${DATABASE_NAME}"
    "neemee-db-user:${DATABASE_USER}"
    "neemee-db-password:${DB_PASSWORD}"
    "neemee-database-url:${CONNECTION_STRING}"
)

for secret in "${secrets[@]}"; do
    IFS=':' read -r secret_name secret_value <<< "$secret"
    echo "Creating secret: $secret_name"
    echo -n "$secret_value" | gcloud secrets create "$secret_name" --data-file=- --project="$PROJECT_ID" 2>/dev/null || \
    echo -n "$secret_value" | gcloud secrets versions add "$secret_name" --data-file=- --project="$PROJECT_ID"
done

echo -e "${GREEN}✅ Credentials stored in Secret Manager${NC}"

# Output configuration
echo ""
echo -e "${GREEN}🎉 Cloud SQL setup complete!${NC}"
echo ""
echo -e "${YELLOW}Configuration:${NC}"
echo "Instance: $INSTANCE_NAME"
echo "Database: $DATABASE_NAME"
echo "User: $DATABASE_USER"
echo "Connection: ${PROJECT_ID}:${REGION}:${INSTANCE_NAME}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Install Prisma: npm install prisma @prisma/client"
echo "2. Initialize Prisma: npx prisma init"
echo "3. Update .env.local with DATABASE_URL secret"
echo "4. Configure Cloud SQL Auth Proxy for local development"
echo ""
echo -e "${YELLOW}Monthly Cost Estimate: ~$7-10 USD${NC}"