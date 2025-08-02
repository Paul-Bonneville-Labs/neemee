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

echo "📦 Deploying frontend with Cloud Build..."

# Use Cloud Build to handle deployment
gcloud builds submit ../frontend --config=../frontend/cloudbuild.yaml

echo "✅ Deployment complete!"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')

echo "🌐 Service URL: $SERVICE_URL"
echo "💻 Frontend Application: $SERVICE_URL"

echo ""
echo "📋 To view logs:"
echo "gcloud logs tail --follow --service $SERVICE_NAME --region $REGION"