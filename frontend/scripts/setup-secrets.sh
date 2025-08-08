#!/bin/bash

# Setup Google Cloud Secrets for Neemee frontend
# This script creates secrets in Google Cloud Secret Manager for sensitive frontend environment variables

set -e

PROJECT_ID="paulbonneville-com"
gcloud config set project $PROJECT_ID

echo "🔐 Setting up Google Cloud Secrets for Neemee frontend..."

# Read current values from .env.production file
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found. Please create it with production values."
    echo "   cp .env.example .env.production"
    echo "   # Then edit .env.production with your production values"
    exit 1
fi

# Source the .env.production file to get current values
source .env.production

# Create secrets for sensitive variables
echo "📝 Creating secrets..."

# Supabase URL (public but good to centralize)
if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo -n "  neemee-supabase-url: "
    if echo "$NEXT_PUBLIC_SUPABASE_URL" | gcloud secrets create neemee-supabase-url --data-file=- 2>/dev/null; then
        echo "✅ Created"
    else
        echo "🔄 Updating existing secret"
        echo "$NEXT_PUBLIC_SUPABASE_URL" | gcloud secrets versions add neemee-supabase-url --data-file=-
    fi
else
    echo "⚠️  NEXT_PUBLIC_SUPABASE_URL not found in .env.production file"
fi

# Supabase Anonymous Key (public but good to centralize)
if [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo -n "  neemee-supabase-anon-key: "
    if echo "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | gcloud secrets create neemee-supabase-anon-key --data-file=- 2>/dev/null; then
        echo "✅ Created"
    else
        echo "🔄 Updating existing secret"
        echo "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | gcloud secrets versions add neemee-supabase-anon-key --data-file=-
    fi
else
    echo "⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.production file"
fi

# Backend API URL
if [ -n "$BACKEND_API_URL" ]; then
    echo -n "  neemee-backend-api-url: "
    if echo "$BACKEND_API_URL" | gcloud secrets create neemee-backend-api-url --data-file=- 2>/dev/null; then
        echo "✅ Created"
    else
        echo "🔄 Updating existing secret"
        echo "$BACKEND_API_URL" | gcloud secrets versions add neemee-backend-api-url --data-file=-
    fi
else
    echo "⚠️  BACKEND_API_URL not found in .env.production file"
fi

# Backend API Key (sensitive)
if [ -n "$BACKEND_API_KEY" ]; then
    echo -n "  neemee-backend-api-key: "
    if echo "$BACKEND_API_KEY" | gcloud secrets create neemee-backend-api-key --data-file=- 2>/dev/null; then
        echo "✅ Created"
    else
        echo "🔄 Updating existing secret"
        echo "$BACKEND_API_KEY" | gcloud secrets versions add neemee-backend-api-key --data-file=-
    fi
else
    echo "⚠️  BACKEND_API_KEY not found in .env.production file"
fi

echo ""
echo "✅ All secrets have been created/updated in Google Cloud Secret Manager!"
echo ""
echo "🔍 You can verify the secrets with:"
echo "  gcloud secrets list --filter='name:neemee-'"
echo ""
echo "🚀 Ready to deploy with secrets using:"
echo "  ./scripts/deploy.sh"