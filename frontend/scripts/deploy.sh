#!/bin/bash

# Deploy Neemee frontend to Google Cloud Run
# Supports staging and production environments with automatic secrets management
# Usage: ./scripts/deploy.sh [staging|production]

set -e

# Environment configuration
ENVIRONMENT=${1:-production}
PROJECT_ID="paulbonneville-com"
REGION="us-central1"

case $ENVIRONMENT in
    staging)
        SERVICE_NAME="neemee-frontend-staging"
        ENV_FILE=".env.staging"
        SECRET_PREFIX="neemee-staging-"
        BASE_URL="https://neemee-frontend-staging-860937201650.us-central1.run.app"
        ;;
    production)
        SERVICE_NAME="neemee-frontend"
        ENV_FILE=".env.production"
        SECRET_PREFIX="neemee-"
        BASE_URL="https://neemee.paulbonneville.com"
        ;;
    *)
        echo "❌ Invalid environment. Usage: ./scripts/deploy.sh [staging|production]"
        echo "   staging    - Deploy to staging environment"
        echo "   production - Deploy to production environment (default)"
        exit 1
        ;;
esac

gcloud config set project $PROJECT_ID

echo "🚀 Deploying Neemee frontend to $ENVIRONMENT environment..."
echo "   Service: $SERVICE_NAME"
echo "   Environment file: $ENV_FILE"
echo "   Secret prefix: $SECRET_PREFIX"
echo ""

# Function to check if a secret exists
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
echo "🔐 Step 1: Setting up/verifying Google Cloud Secrets for $ENVIRONMENT..."

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ $ENV_FILE file not found. Please create it with $ENVIRONMENT values."
    echo "   cp .env.example $ENV_FILE"
    echo "   # Then edit $ENV_FILE with your $ENVIRONMENT values"
    exit 1
fi

# Source the environment file to get current values
source "$ENV_FILE"

# Create/update all secrets with environment-specific naming
create_or_update_secret "${SECRET_PREFIX}database-url" "$DATABASE_URL"
create_or_update_secret "${SECRET_PREFIX}auth-secret" "$AUTH_SECRET"
create_or_update_secret "${SECRET_PREFIX}google-oauth-id" "$AUTH_GOOGLE_ID"
create_or_update_secret "${SECRET_PREFIX}google-oauth-secret" "$AUTH_GOOGLE_SECRET"
create_or_update_secret "${SECRET_PREFIX}github-oauth-id" "$AUTH_GITHUB_ID"
create_or_update_secret "${SECRET_PREFIX}github-oauth-secret" "$AUTH_GITHUB_SECRET"
create_or_update_secret "${SECRET_PREFIX}backend-api-url" "$BACKEND_API_URL"
create_or_update_secret "${SECRET_PREFIX}backend-api-key" "$BACKEND_API_KEY"

# Step 2: Verify all secrets exist
echo ""
echo "🔍 Step 2: Verifying all secrets exist for $ENVIRONMENT..."

SECRETS=(
  "${SECRET_PREFIX}database-url"
  "${SECRET_PREFIX}auth-secret"
  "${SECRET_PREFIX}google-oauth-id"
  "${SECRET_PREFIX}google-oauth-secret"
  "${SECRET_PREFIX}github-oauth-id"
  "${SECRET_PREFIX}github-oauth-secret"
  "${SECRET_PREFIX}backend-api-url"
  "${SECRET_PREFIX}backend-api-key"
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
    echo "❌ Some secrets are missing. Please check your $ENV_FILE configuration."
    exit 1
fi

# Step 3: Deploy to Cloud Run
echo ""
echo "📦 Step 3: Deploying to Google Cloud Run ($ENVIRONMENT)..."

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
  --set-secrets DATABASE_URL=${SECRET_PREFIX}database-url:latest \
  --set-secrets AUTH_SECRET=${SECRET_PREFIX}auth-secret:latest \
  --set-secrets AUTH_GOOGLE_ID=${SECRET_PREFIX}google-oauth-id:latest \
  --set-secrets AUTH_GOOGLE_SECRET=${SECRET_PREFIX}google-oauth-secret:latest \
  --set-secrets AUTH_GITHUB_ID=${SECRET_PREFIX}github-oauth-id:latest \
  --set-secrets AUTH_GITHUB_SECRET=${SECRET_PREFIX}github-oauth-secret:latest \
  --set-secrets BACKEND_API_URL=${SECRET_PREFIX}backend-api-url:latest \
  --set-secrets BACKEND_API_KEY=${SECRET_PREFIX}backend-api-key:latest \
  --set-env-vars NODE_ENV=$ENVIRONMENT \
  --set-env-vars NEXT_PUBLIC_BASE_URL=$BASE_URL \
  --set-env-vars NEXTAUTH_URL=$BASE_URL

echo ""
echo "🎉 $ENVIRONMENT deployment completed successfully!"
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
echo ""
echo "🔐 Secrets used in this deployment:"
for secret in "${SECRETS[@]}"; do
  echo "  $secret"
done