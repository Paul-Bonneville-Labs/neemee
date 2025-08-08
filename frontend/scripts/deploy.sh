#!/bin/bash

# Deploy Neemee frontend to Google Cloud Run
# This script automatically handles secrets creation/verification and deployment in one command

set -e

PROJECT_ID="paulbonneville-com"
SERVICE_NAME="neemee-frontend"
REGION="us-central1"

gcloud config set project $PROJECT_ID

echo "🚀 Deploying Neemee frontend to Google Cloud Run (with automatic secrets management)..."

# Function to check if a secret exists (using list instead of access to avoid triggering builds)
secret_exists() {
    gcloud secrets describe "$1" >/dev/null 2>&1
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

# Check if .env.production file exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found. Please create it with production values."
    echo "   cp .env.example .env.production"
    echo "   # Then edit .env.production with your production values"
    exit 1
fi

# Source the .env.production file to get current values
source .env.production

# Create/update all secrets
create_or_update_secret "neemee-supabase-url" "$NEXT_PUBLIC_SUPABASE_URL"
create_or_update_secret "neemee-supabase-anon-key" "$NEXT_PUBLIC_SUPABASE_ANON_KEY"
create_or_update_secret "neemee-backend-api-url" "$BACKEND_API_URL"
create_or_update_secret "neemee-backend-api-key" "$BACKEND_API_KEY"

# Step 2: Verify all secrets exist (using describe to avoid triggering builds)
echo ""
echo "🔍 Step 2: Verifying all secrets exist..."

SECRETS=(
  "neemee-supabase-url"
  "neemee-supabase-anon-key"
  "neemee-backend-api-url"
  "neemee-backend-api-key"
)

secrets_ok=true
for secret in "${SECRETS[@]}"; do
  echo -n "  $secret: "
  if gcloud secrets describe "$secret" >/dev/null 2>&1; then
    echo "✅ Exists"
  else
    echo "❌ Missing"
    secrets_ok=false
  fi
done

if [ "$secrets_ok" != true ]; then
    echo ""
    echo "❌ Some secrets are missing. Please check your configuration."
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
  --set-secrets NEXT_PUBLIC_SUPABASE_URL=neemee-supabase-url:latest \
  --set-secrets NEXT_PUBLIC_SUPABASE_ANON_KEY=neemee-supabase-anon-key:latest \
  --set-secrets BACKEND_API_URL=neemee-backend-api-url:latest \
  --set-secrets BACKEND_API_KEY=neemee-backend-api-key:latest \
  --set-env-vars NODE_ENV=production \
  --set-env-vars NEXT_PUBLIC_BASE_URL=https://neemee.paulbonneville.com

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