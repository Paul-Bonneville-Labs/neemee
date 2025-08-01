#!/bin/bash

# Setup Google Cloud Secrets for Neemee frontend
# This script creates secrets in Google Cloud Secret Manager for sensitive frontend environment variables

set -e

PROJECT_ID="paulbonneville-com"
gcloud config set project $PROJECT_ID

echo "🔐 Setting up Google Cloud Secrets for Neemee frontend..."

# Read current values from .env file
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create it from .env.example first."
    exit 1
fi

# Source the .env file to get current values
source .env

# Create secrets for sensitive variables
echo "📝 Creating secrets..."

# GitHub Token (sensitive)
if [ -n "$GITHUB_TOKEN" ]; then
    echo -n "  neemee-github-token: "
    if echo "$GITHUB_TOKEN" | gcloud secrets create neemee-github-token --data-file=- 2>/dev/null; then
        echo "✅ Created"
    else
        echo "🔄 Updating existing secret"
        echo "$GITHUB_TOKEN" | gcloud secrets versions add neemee-github-token --data-file=-
    fi
else
    echo "⚠️  GITHUB_TOKEN not found in .env file"
fi

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
    echo "⚠️  NEXT_PUBLIC_SUPABASE_URL not found in .env file"
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
    echo "⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env file"
fi

# GitHub Repository Configuration
if [ -n "$GITHUB_REPO_OWNER" ]; then
    echo -n "  neemee-github-repo-owner: "
    if echo "$GITHUB_REPO_OWNER" | gcloud secrets create neemee-github-repo-owner --data-file=- 2>/dev/null; then
        echo "✅ Created"
    else
        echo "🔄 Updating existing secret"
        echo "$GITHUB_REPO_OWNER" | gcloud secrets versions add neemee-github-repo-owner --data-file=-
    fi
else
    echo "⚠️  GITHUB_REPO_OWNER not found in .env file"
fi

if [ -n "$GITHUB_REPO_NAME" ]; then
    echo -n "  neemee-github-repo-name: "
    if echo "$GITHUB_REPO_NAME" | gcloud secrets create neemee-github-repo-name --data-file=- 2>/dev/null; then
        echo "✅ Created"
    else
        echo "🔄 Updating existing secret"
        echo "$GITHUB_REPO_NAME" | gcloud secrets versions add neemee-github-repo-name --data-file=-
    fi
else
    echo "⚠️  GITHUB_REPO_NAME not found in .env file"
fi

echo ""
echo "✅ All secrets have been created/updated in Google Cloud Secret Manager!"
echo ""
echo "🔍 You can verify the secrets with:"
echo "  gcloud secrets list --filter='name:neemee-'"
echo ""
echo "🚀 Ready to deploy with secrets using:"
echo "  ./scripts/deploy-with-secrets.sh"