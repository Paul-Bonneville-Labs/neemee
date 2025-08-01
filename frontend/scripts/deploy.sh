#!/bin/bash

# Deploy Neemee frontend to Google Cloud Run
# This script automatically handles secrets creation/verification and deployment in one command

set -e

PROJECT_ID="paulbonneville-com"
SERVICE_NAME="neemee-frontend"
REGION="us-central1"

gcloud config set project $PROJECT_ID

echo "🚀 Deploying Neemee frontend to Google Cloud Run (with automatic secrets management)..."

# Function to check if a secret exists
secret_exists() {
    gcloud secrets versions access latest --secret="$1" >/dev/null 2>&1
}

# Function to create or update a secret
create_or_update_secret() {
    local secret_name="$1"
    local secret_value="$2"
    
    if [ -z "$secret_value" ]; then
        echo "⚠️  Warning: $secret_name value is empty, skipping..."
        return
    fi
    
    echo -n "  $secret_name: "
    if secret_exists "$secret_name"; then
        echo "🔄 Updating existing secret"
        echo "$secret_value" | gcloud secrets versions add "$secret_name" --data-file=- >/dev/null
    else
        echo "✅ Creating new secret"
        echo "$secret_value" | gcloud secrets create "$secret_name" --data-file=- >/dev/null
    fi
}

# Step 1: Automatic secrets setup
echo "🔐 Step 1: Setting up/verifying Google Cloud Secrets..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create it from .env.example first."
    echo "   cp .env.example .env"
    echo "   # Then edit .env with your actual values"
    exit 1
fi

# Source the .env file to get current values
source .env

# Create/update all secrets
create_or_update_secret "neemee-github-token" "$GITHUB_TOKEN"
create_or_update_secret "neemee-supabase-url" "$NEXT_PUBLIC_SUPABASE_URL"
create_or_update_secret "neemee-supabase-anon-key" "$NEXT_PUBLIC_SUPABASE_ANON_KEY"
create_or_update_secret "neemee-github-repo-owner" "$GITHUB_REPO_OWNER"
create_or_update_secret "neemee-github-repo-name" "$GITHUB_REPO_NAME"

# Step 2: Verify all secrets are accessible
echo ""
echo "🔍 Step 2: Verifying all secrets are accessible..."

SECRETS=(
  "neemee-github-token"
  "neemee-supabase-url"
  "neemee-supabase-anon-key"
  "neemee-github-repo-owner"
  "neemee-github-repo-name"
)

secrets_ok=true
for secret in "${SECRETS[@]}"; do
  echo -n "  $secret: "
  if secret_exists "$secret"; then
    echo "✅ Available"
  else
    echo "❌ Missing or inaccessible"
    secrets_ok=false
  fi
done

if [ "$secrets_ok" != true ]; then
    echo ""
    echo "❌ Some secrets are not accessible. Please check your configuration."
    exit 1
fi

# Step 3: Deploy to Cloud Run
echo ""
echo "📦 Step 3: Deploying to Google Cloud Run..."

gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 100 \
  --concurrency 80 \
  --timeout 300 \
  --allow-unauthenticated \
  --set-secrets GITHUB_TOKEN=neemee-github-token:latest \
  --set-secrets NEXT_PUBLIC_SUPABASE_URL=neemee-supabase-url:latest \
  --set-secrets NEXT_PUBLIC_SUPABASE_ANON_KEY=neemee-supabase-anon-key:latest \
  --set-secrets GITHUB_REPO_OWNER=neemee-github-repo-owner:latest \
  --set-secrets GITHUB_REPO_NAME=neemee-github-repo-name:latest \
  --set-env-vars NODE_ENV=production

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "🌐 Your application is available at:"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
echo "  $SERVICE_URL"
echo ""
echo "📊 View logs with:"
echo "  gcloud logs tail --follow --service $SERVICE_NAME --region $REGION"
echo ""
echo "🔧 Manage service with:"
echo "  gcloud run services describe $SERVICE_NAME --region $REGION"