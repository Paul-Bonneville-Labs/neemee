#!/bin/bash

# Prisma Setup Script for Neemee Frontend
# Sets up Prisma with Cloud SQL integration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 Prisma Setup for Neemee Frontend${NC}"
echo "======================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found. Please run this from the frontend directory.${NC}"
    exit 1
fi

# Install dependencies if not already installed
echo -e "${YELLOW}Step 1: Installing Prisma dependencies...${NC}"
if ! npm list @prisma/client &>/dev/null; then
    npm install @prisma/client
    npm install -D prisma
    echo -e "${GREEN}✅ Prisma dependencies installed${NC}"
else
    echo -e "${YELLOW}ℹ️  Prisma dependencies already installed${NC}"
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Copying from example...${NC}"
    if [ -f ".env.prisma.example" ]; then
        cp .env.prisma.example .env.local
        echo -e "${GREEN}✅ Created .env.local from template${NC}"
        echo -e "${YELLOW}📝 Please update DATABASE_URL in .env.local with your actual credentials${NC}"
    else
        echo -e "${RED}❌ .env.prisma.example not found${NC}"
        exit 1
    fi
fi

# Load environment variables
if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | grep -v '^[[:space:]]*$' | xargs)
fi

echo -e "${YELLOW}Step 2: Checking database connection...${NC}"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL not set in .env.local${NC}"
    echo "Please set DATABASE_URL in .env.local before continuing"
    exit 1
fi

echo -e "${GREEN}✅ DATABASE_URL configured${NC}"

echo -e "${YELLOW}Step 3: Setting up Prisma schema...${NC}"

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

echo -e "${GREEN}✅ Prisma client generated${NC}"

echo -e "${YELLOW}Step 4: Database operations...${NC}"

# Check if we should pull from existing database or push schema
echo "Choose an option:"
echo "1) Pull schema from existing Supabase database (introspect)"
echo "2) Push current schema to new Cloud SQL database"
echo "3) Skip database operations for now"
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo "Pulling schema from existing database..."
        npx prisma db pull
        echo "Regenerating client with new schema..."
        npx prisma generate
        echo -e "${GREEN}✅ Schema pulled from database${NC}"
        ;;
    2)
        echo "Pushing schema to database..."
        npx prisma db push
        echo -e "${GREEN}✅ Schema pushed to database${NC}"
        ;;
    3)
        echo -e "${YELLOW}ℹ️  Skipping database operations${NC}"
        ;;
    *)
        echo -e "${YELLOW}ℹ️  Invalid choice, skipping database operations${NC}"
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Prisma setup complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update DATABASE_URL in .env.local if needed"
echo "2. Run 'npx prisma studio' to explore your database"
echo "3. Start replacing Supabase calls with Prisma queries"
echo "4. Run 'npm run dev' to test the setup"
echo ""
echo -e "${YELLOW}Useful Prisma commands:${NC}"
echo "- npx prisma studio      # Database GUI"
echo "- npx prisma db pull     # Pull schema from database"
echo "- npx prisma db push     # Push schema to database"
echo "- npx prisma generate    # Regenerate client"
echo "- npx prisma migrate dev # Create and apply migration"