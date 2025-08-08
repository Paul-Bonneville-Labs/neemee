#!/bin/bash

# Setup Google Cloud Secrets for Neemee frontend
# This script creates secrets in Google Cloud Secret Manager for Auth.js and database environment variables

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

# Database URL (sensitive)
if [ -n "$DATABASE_URL" ]; then
    echo -n "  neemee-database-url: "
    if echo "$DATABASE_URL" | gcloud secrets create neemee-database-url --data-file=- 2>/dev/null; then
        echo "✅ Created"
    else
        echo "🔄 Updating existing secret"
        echo "$DATABASE_URL" | gcloud secrets versions add neemee-database-url --data-file=-
    fi
else
    echo "⚠️  DATABASE_URL not found in .env.production file"
fi

# Auth.js Secret (sensitive)
if [ -n "$AUTH_SECRET" ]; then
    echo -n "  neemee-auth-secret: "
    if echo "$AUTH_SECRET" | gcloud secrets create neemee-auth-secret --data-file=- 2>/dev/null; then
        echo "✅ Created"
    else
        echo "🔄 Updating existing secret"
        echo "$AUTH_SECRET" | gcloud secrets versions add neemee-auth-secret --data-file=-
    fi
else
    echo "⚠️  AUTH_SECRET not found in .env.production file"
fi

# Google OAuth (sensitive)
if [ -n "$AUTH_GOOGLE_ID" ]; then
    echo -n "  neemee-google-oauth-id: "
    if echo "$AUTH_GOOGLE_ID" | gcloud secrets create neemee-google-oauth-id --data-file=- 2>/dev/null; then
        echo "✅ Created"
    else
        echo "🔄 Updating existing secret"
        echo "$AUTH_GOOGLE_ID" | gcloud secrets versions add neemee-google-oauth-id --data-file=-
    fi
else
    echo "⚠️  AUTH_GOOGLE_ID not found in .env.production file"
fi

if [ -n "$AUTH_GOOGLE_SECRET" ]; then
    echo -n "  neemee-google-oauth-secret: "
    if echo "$AUTH_GOOGLE_SECRET" | gcloud secrets create neemee-google-oauth-secret --data-file=- 2>/dev/null; then
        echo "✅ Created"
    else
        echo "🔄 Updating existing secret"
        echo "$AUTH_GOOGLE_SECRET" | gcloud secrets versions add neemee-google-oauth-secret --data-file=-
    fi
else
    echo "⚠️  AUTH_GOOGLE_SECRET not found in .env.production file"
fi

# GitHub OAuth (sensitive)
if [ -n "$AUTH_GITHUB_ID" ]; then
    echo -n "  neemee-github-oauth-id: "
    if echo "$AUTH_GITHUB_ID" | gcloud secrets create neemee-github-oauth-id --data-file=- 2>/dev/null; then
        echo "✅ Created"
    else
        echo "🔄 Updating existing secret"
        echo "$AUTH_GITHUB_ID" | gcloud secrets versions add neemee-github-oauth-id --data-file=-
    fi
else
    echo "⚠️  AUTH_GITHUB_ID not found in .env.production file"
fi

if [ -n "$AUTH_GITHUB_SECRET" ]; then
    echo -n "  neemee-github-oauth-secret: "
    if echo "$AUTH_GITHUB_SECRET" | gcloud secrets create neemee-github-oauth-secret --data-file=- 2>/dev/null; then
        echo "✅ Created"
    else
        echo "🔄 Updating existing secret"
        echo "$AUTH_GITHUB_SECRET" | gcloud secrets versions add neemee-github-oauth-secret --data-file=-
    fi
else
    echo "⚠️  AUTH_GITHUB_SECRET not found in .env.production file"
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