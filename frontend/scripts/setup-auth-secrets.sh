#!/bin/bash

# Setup Auth.js Secrets for Multi-Environment Deployment
set -e

PROJECT_ID=${PROJECT_ID:-"paulbonneville-com"}
gcloud config set project $PROJECT_ID

echo "🔐 Setting up Auth.js secrets for multi-environment deployment..."
echo "Project: $PROJECT_ID"

# Function to create or update a secret
create_or_update_secret() {
    local secret_name=$1
    local secret_value=$2
    
    if [ -z "$secret_value" ]; then
        echo "⚠️  Warning: Empty value for secret $secret_name, skipping..."
        return
    fi
    
    echo -n "  $secret_name: "
    
    # Check if secret exists
    if gcloud secrets describe "$secret_name" >/dev/null 2>&1; then
        # Update existing secret
        echo "$secret_value" | gcloud secrets versions add "$secret_name" --data-file=-
        echo "🔄 Updated"
    else
        # Create new secret
        echo "$secret_value" | gcloud secrets create "$secret_name" --data-file=-
        echo "✅ Created"
    fi
}

# Generate strong auth secrets if not provided
generate_auth_secret() {
    openssl rand -base64 32
}

echo ""
echo "🏗️  Production Auth.js Secrets:"
echo "==============================="

# Check if we should read from .env.production
if [ -f ".env.production" ]; then
    echo "Reading production configuration..."
    
    # Read production database URL if provided
    PROD_DATABASE_URL=$(grep "^DATABASE_URL=" .env.production | cut -d'=' -f2- | tr -d '"' || echo "")
    create_or_update_secret "neemee-database-url" "$PROD_DATABASE_URL"
    
    # Generate production auth secret
    create_or_update_secret "neemee-auth-secret" "$(generate_auth_secret)"
else
    echo "⚠️  .env.production not found, creating basic production secrets..."
    create_or_update_secret "neemee-auth-secret" "$(generate_auth_secret)"
fi

# Production OAuth secrets (need to be provided manually)
echo ""
echo "📝 Note: You need to manually set these production OAuth secrets:"
echo "  - neemee-google-oauth-id"
echo "  - neemee-google-oauth-secret"
echo "  - neemee-github-oauth-id"
echo "  - neemee-github-oauth-secret"
echo ""
echo "Example commands:"
echo '  echo "your-prod-google-id" | gcloud secrets create neemee-google-oauth-id --data-file=-'
echo '  echo "your-prod-google-secret" | gcloud secrets create neemee-google-oauth-secret --data-file=-'

echo ""
echo "🧪 Staging Auth.js Secrets:"
echo "==========================="

# Check if we should read from .env.staging
if [ -f ".env.staging" ]; then
    echo "Reading staging configuration..."
    
    # Read staging database URL if provided
    STAGING_DATABASE_URL=$(grep "^DATABASE_URL=" .env.staging | cut -d'=' -f2- | tr -d '"' || echo "")
    create_or_update_secret "neemee-staging-database-url" "$STAGING_DATABASE_URL"
    
    # Generate staging auth secret
    create_or_update_secret "neemee-staging-auth-secret" "$(generate_auth_secret)"
else
    echo "⚠️  .env.staging not found, creating basic staging secrets..."
    create_or_update_secret "neemee-staging-auth-secret" "$(generate_auth_secret)"
fi

# Staging OAuth secrets (need to be provided manually)
echo ""
echo "📝 Note: You need to manually set these staging OAuth secrets:"
echo "  - neemee-staging-google-id"
echo "  - neemee-staging-google-secret"
echo "  - neemee-staging-github-id"
echo "  - neemee-staging-github-secret"
echo ""
echo "Example commands:"
echo '  echo "your-staging-google-id" | gcloud secrets create neemee-staging-google-id --data-file=-'
echo '  echo "your-staging-google-secret" | gcloud secrets create neemee-staging-google-secret --data-file=-'

echo ""
echo "🎯 Auth.js secrets setup complete!"
echo ""
echo "📋 Current Auth.js Secrets:"
echo "=========================="
gcloud secrets list --filter="name:neemee-" --format="table(name,createTime.date())"

echo ""
echo "🚀 Next steps:"
echo "1. Set up OAuth applications for staging and production environments"
echo "2. Update the OAuth secrets using the commands shown above"
echo "3. Configure Cloud Build triggers"
echo "4. Test deployments"