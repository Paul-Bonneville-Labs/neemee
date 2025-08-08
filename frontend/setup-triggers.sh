#!/bin/bash

# Setup Cloud Build triggers using gcloud CLI
# Run this script after completing GitHub OAuth connection

set -e

echo "🚀 Setting up Cloud Build triggers..."

# Check if GitHub connection is complete
echo "Checking GitHub connection status..."
CONNECTION_STATUS=$(gcloud builds connections describe paul-bonneville-labs-connection --region=us-central1 --format="value(installationState.stage)")

if [ "$CONNECTION_STATUS" != "COMPLETE" ]; then
    echo "❌ GitHub connection not complete. Please visit:"
    echo "https://console.cloud.google.com/cloud-build/triggers"
    echo "And complete the GitHub OAuth connection setup first."
    exit 1
fi

echo "✅ GitHub connection is complete"

# Create repository connection if it doesn't exist
echo "Creating repository connection..."
gcloud builds repositories create neemee-repo \
  --connection=paul-bonneville-labs-connection \
  --region=us-central1 \
  --remote-uri=https://github.com/Paul-Bonneville-Labs/neemee.git \
  || echo "Repository may already exist"

echo "Creating CI trigger..."
gcloud builds triggers create github \
  --repository=projects/paulbonneville-com/locations/us-central1/connections/paul-bonneville-labs-connection/repositories/neemee-repo \
  --pull-request-pattern=".*" \
  --build-config=frontend/cloudbuild-ci.yaml \
  --name=neemee-frontend-ci \
  --description="CI validation for all pull requests" \
  --service-account="860937201650@cloudbuild.gserviceaccount.com" \
  --region=us-central1

echo "Creating staging trigger..."
gcloud builds triggers create github \
  --repository=projects/paulbonneville-com/locations/us-central1/connections/paul-bonneville-labs-connection/repositories/neemee-repo \
  --branch-pattern="^develop$" \
  --build-config=frontend/cloudbuild-staging.yaml \
  --name=neemee-frontend-staging \
  --description="Automatic staging deployment" \
  --service-account="860937201650@cloudbuild.gserviceaccount.com" \
  --region=us-central1

echo "Creating production trigger..."
gcloud builds triggers create github \
  --repository=projects/paulbonneville-com/locations/us-central1/connections/paul-bonneville-labs-connection/repositories/neemee-repo \
  --branch-pattern="^main$" \
  --build-config=frontend/cloudbuild-production.yaml \
  --name=neemee-frontend-production \
  --description="Automatic production deployment with safety checks" \
  --service-account="860937201650@cloudbuild.gserviceaccount.com" \
  --region=us-central1

echo "✅ All triggers created successfully!"
echo ""
echo "📋 Verify triggers:"
gcloud builds triggers list
echo ""
echo "🎯 Next steps:"
echo "1. Test CI trigger by creating a pull request"
echo "2. Test staging by pushing to develop branch"
echo "3. Test production by pushing to main branch"