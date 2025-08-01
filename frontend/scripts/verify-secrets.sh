#!/bin/bash

# Verify that all required secrets are available in Google Cloud Secret Manager
# This script checks the secrets needed for the Neemee frontend deployment

set -e

PROJECT_ID="paulbonneville-com"
gcloud config set project $PROJECT_ID

echo "🔍 Verifying Neemee frontend secrets in Google Cloud..."

SECRETS=(
    "neemee-github-token"
    "neemee-supabase-url" 
    "neemee-supabase-anon-key"
    "neemee-github-repo-owner"
    "neemee-github-repo-name"
)

all_secrets_ok=true

for secret in "${SECRETS[@]}"; do
    echo -n "  $secret: "
    if gcloud secrets versions access latest --secret="$secret" >/dev/null 2>&1; then
        echo "✅ Available"
    else
        echo "❌ Missing or inaccessible"
        all_secrets_ok=false
    fi
done

echo ""

if [ "$all_secrets_ok" = true ]; then
    echo "✅ All secrets are configured and accessible!"
    echo ""
    echo "🔗 Testing secret values (redacted)..."
    
    # Test each secret and show first few characters for verification
    GITHUB_TOKEN=$(gcloud secrets versions access latest --secret="neemee-github-token")
    SUPABASE_URL=$(gcloud secrets versions access latest --secret="neemee-supabase-url")
    SUPABASE_KEY=$(gcloud secrets versions access latest --secret="neemee-supabase-anon-key")
    REPO_OWNER=$(gcloud secrets versions access latest --secret="neemee-github-repo-owner")
    REPO_NAME=$(gcloud secrets versions access latest --secret="neemee-github-repo-name")
    
    echo "  GitHub Token: ${GITHUB_TOKEN:0:8}..."
    echo "  Supabase URL: $SUPABASE_URL"
    echo "  Supabase Key: ${SUPABASE_KEY:0:8}..."
    echo "  Repo Owner: $REPO_OWNER"
    echo "  Repo Name: $REPO_NAME"
    
    echo ""
    echo "🚀 Ready for deployment with:"
    echo "  ./scripts/deploy-with-secrets.sh"
else
    echo "❌ Some secrets are missing!"
    echo ""
    echo "Run the following to create missing secrets:"
    echo "  ./scripts/setup-secrets.sh"
    exit 1
fi