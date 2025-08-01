#!/bin/bash

# Deploy Neemee frontend to Google Cloud Run with secrets integration
# This script deploys the Next.js application with proper secrets mounting

set -e

PROJECT_ID="paulbonneville-com"
SERVICE_NAME="neemee-frontend"
REGION="us-central1"

gcloud config set project $PROJECT_ID

echo "🚀 Deploying Neemee frontend to Google Cloud Run with secrets..."

# Verify all required secrets exist
echo "🔍 Verifying secrets exist..."

SECRETS=(
  "neemee-github-token"
  "neemee-supabase-url"
  "neemee-supabase-anon-key"
  "neemee-github-repo-owner"
  "neemee-github-repo-name"
)

for secret in "${SECRETS[@]}"; do
  echo -n "  $secret: "
  if gcloud secrets versions access latest --secret="$secret" >/dev/null 2>&1; then
    echo "✅ Available"
  else
    echo "❌ Missing or inaccessible"
    echo ""
    echo "Please run ./scripts/setup-secrets.sh first to create the required secrets."
    exit 1
  fi
done

echo ""
echo "📦 Deploying to Cloud Run..."

# Deploy with secrets mounted as environment variables
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
echo "✅ Deployment completed successfully!"
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