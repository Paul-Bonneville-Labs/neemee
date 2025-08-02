#!/bin/bash

# Deploy Neemee backend API to Google Cloud Run with secrets
# This script deploys the production version with all required secrets

set -e

echo "🚀 Deploying Neemee Backend API to Google Cloud Run..."

# Skip pre-deployment tests for Cloud Build deployment
# Cloud Build will handle environment setup and testing
echo "⏭️  Skipping pre-deployment tests (Cloud Build will handle environment setup)"

# Set project and region
PROJECT_ID="paulbonneville-com"
REGION="us-central1"
SERVICE_NAME="neemee-backend"

# Ensure we're using the correct project
gcloud config set project $PROJECT_ID

echo "📦 Building and deploying with Cloud Build..."

# Use Cloud Build to handle both building and deployment
gcloud builds submit ../backend --config=../backend/cloudbuild.yaml

echo "✅ Deployment complete!"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')

echo "🌐 Service URL: $SERVICE_URL"
echo "📊 Health Check: $SERVICE_URL/health"
echo "📋 API Documentation: $SERVICE_URL/docs"
echo "🔍 Newsletter Health: $SERVICE_URL/newsletter/health"

echo ""
echo "🔑 To test the API, you'll need to authenticate:"
echo "gcloud auth print-identity-token | curl -H \"Authorization: Bearer \$(cat)\" $SERVICE_URL/newsletter/health"

echo ""
echo "📋 To view logs:"
echo "gcloud logs tail --follow --service $SERVICE_NAME --region $REGION"