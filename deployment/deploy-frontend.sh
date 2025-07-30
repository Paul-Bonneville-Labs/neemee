#!/bin/bash

# Deploy Neemee frontend to Google Cloud Run
# Adapted from arrgh-fastapi deployment approach

set -e

echo "🚀 Deploying Neemee Frontend to Google Cloud Run..."

# Set project and region
PROJECT_ID="paulbonneville-com"
REGION="us-central1"
SERVICE_NAME="neemee-frontend"

# Ensure we're using the correct project
gcloud config set project $PROJECT_ID

echo "📦 Deploying frontend with buildpacks..."

# Deploy frontend to Cloud Run using buildpacks (no Docker build needed)
gcloud run deploy $SERVICE_NAME \
  --source ./frontend \
  --platform managed \
  --region $REGION \
  --set-env-vars ENVIRONMENT=production \
  --set-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT_ID \
  --set-env-vars GOOGLE_CLOUD_REGION=$REGION \
  --memory 1Gi \
  --cpu 1 \
  --concurrency 80 \
  --min-instances 0 \
  --max-instances 100 \
  --timeout 300 \
  --port 3000 \
  --no-invoker-iam-check

echo "✅ Deployment complete!"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')

echo "🌐 Service URL: $SERVICE_URL"
echo "💻 Frontend Application: $SERVICE_URL"

echo ""
echo "📋 To view logs:"
echo "gcloud logs tail --follow --service $SERVICE_NAME --region $REGION"