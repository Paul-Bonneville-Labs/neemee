# Neemee Auth.js v5 + Prisma Deployment Guide

## Overview

This guide covers the complete deployment setup for Neemee with Auth.js v5, Prisma ORM, and multi-environment Cloud Run deployment.

## Architecture

- **Frontend**: Next.js 15 + Auth.js v5 + Prisma ORM
- **Database**: Cloud SQL PostgreSQL (separate instances for staging/production)
- **Authentication**: Auth.js v5 with Google and GitHub OAuth providers
- **Deployment**: Google Cloud Run with multi-environment setup
- **Secrets**: Google Cloud Secret Manager

## Environment Structure

```
.env.local          # Local development
.env.staging        # Staging environment template
.env.production     # Production environment template
```

## Prerequisites

1. **Google Cloud CLI** installed and configured
2. **OAuth Applications** created for both staging and production:
   - Google Cloud Console OAuth credentials
   - GitHub OAuth applications
3. **Cloud SQL instances** created and running
4. **Required permissions** for Cloud Run, Cloud Build, Secret Manager

## Deployment Process

### 1. Database Setup

#### Production Database (Already Created)
- Instance: `neemee-postgres-poc`
- Database: `neemee`
- User: `neemee_user`

#### Staging Database
```bash
# Wait for staging instance creation
gcloud sql instances list

# Once ready, set up staging database
./scripts/setup-staging-db.sh
```

### 2. OAuth Setup

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client IDs for:
   - **Production**: Authorized redirect URI: `https://neemee.paulbonneville.com/api/auth/callback/google`
   - **Staging**: Authorized redirect URI: `https://staging.neemee.paulbonneville.com/api/auth/callback/google`

#### GitHub OAuth Setup
1. Go to [GitHub Developer Settings](https://github.com/settings/applications/new)
2. Create OAuth Apps for:
   - **Production**: Authorization callback URL: `https://neemee.paulbonneville.com/api/auth/callback/github`
   - **Staging**: Authorization callback URL: `https://staging.neemee.paulbonneville.com/api/auth/callback/github`

### 3. Secrets Configuration

#### Update Production OAuth Secrets
```bash
# Google OAuth
echo "your-prod-google-client-id" | gcloud secrets create neemee-google-oauth-id --data-file=-
echo "your-prod-google-client-secret" | gcloud secrets create neemee-google-oauth-secret --data-file=-

# GitHub OAuth
echo "your-prod-github-client-id" | gcloud secrets create neemee-github-oauth-id --data-file=-
echo "your-prod-github-client-secret" | gcloud secrets create neemee-github-oauth-secret --data-file=-
```

#### Update Staging OAuth Secrets
```bash
# Google OAuth
echo "your-staging-google-client-id" | gcloud secrets create neemee-staging-google-id --data-file=-
echo "your-staging-google-client-secret" | gcloud secrets create neemee-staging-google-secret --data-file=-

# GitHub OAuth
echo "your-staging-github-client-id" | gcloud secrets create neemee-staging-github-id --data-file=-
echo "your-staging-github-client-secret" | gcloud secrets create neemee-staging-github-secret --data-file=-
```

### 4. Cloud Build Triggers

#### Staging Trigger (Develop Branch)
```bash
gcloud builds triggers create github \
  --repo-name="neemee" \
  --repo-owner="Paul-Bonneville-Labs" \
  --branch-pattern="^develop$" \
  --build-config="cloudbuild-staging.yaml" \
  --name="neemee-frontend-staging-deploy" \
  --description="Deploy staging environment from develop branch"
```

#### Production Trigger (Main Branch)
```bash
gcloud builds triggers create github \
  --repo-name="neemee" \
  --repo-owner="Paul-Bonneville-Labs" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild-production.yaml" \
  --name="neemee-frontend-production-deploy" \
  --description="Deploy production environment from main branch"
```

### 5. Database Migrations

#### Production Database
```bash
# Start Cloud SQL Proxy
./cloud_sql_proxy -instances=paulbonneville-com:us-central1:neemee-postgres-poc=tcp:5433 &

# Apply migrations
export DATABASE_URL="postgresql://neemee_user:password@localhost:5433/neemee"
npx prisma db push
```

#### Staging Database
```bash
# Start Cloud SQL Proxy for staging
./cloud_sql_proxy -instances=paulbonneville-com:us-central1:neemee-postgres-staging=tcp:5434 &

# Apply migrations
export DATABASE_URL="postgresql://neemee_user:staging_password@localhost:5434/neemee_staging"
npx prisma db push
```

## Deployment Commands

### Manual Deployment

#### Staging
```bash
gcloud builds submit --config=cloudbuild-staging.yaml
```

#### Production
```bash
gcloud builds submit --config=cloudbuild-production.yaml
```

### Automatic Deployment
- **Staging**: Push to `develop` branch
- **Production**: Push to `main` branch

## Environment URLs

- **Local Development**: http://localhost:3000
- **Staging**: https://staging.neemee.paulbonneville.com
- **Production**: https://neemee.paulbonneville.com

## Monitoring & Troubleshooting

### View Logs
```bash
# Staging logs
gcloud run logs tail --service=neemee-frontend-staging --region=us-central1

# Production logs
gcloud run logs tail --service=neemee-frontend --region=us-central1
```

### Check Secrets
```bash
gcloud secrets list --filter="name:neemee-"
```

### Database Access
```bash
# Production
gcloud sql connect neemee-postgres-poc --user=neemee_user

# Staging
gcloud sql connect neemee-postgres-staging --user=neemee_user
```

## Security Considerations

1. **OAuth Redirect URIs** must match exactly
2. **Auth Secrets** are auto-generated and stored securely
3. **Database passwords** are managed through Secret Manager
4. **CORS** is configured for staging and production domains
5. **Environment isolation** prevents cross-contamination

## Cost Optimization

- **Staging**: Uses `db-f1-micro` (shared-core, 0.6GB RAM)
- **Production**: Uses existing `db-f1-micro` instance
- **Cloud Run**: Staging limited to 10 max instances, production to 100
- **Images**: Staging retention 30 days, production longer retention

## Next Steps

1. ✅ Complete staging database setup when instance is ready
2. ✅ Configure OAuth applications
3. ✅ Update OAuth secrets
4. ✅ Set up Cloud Build triggers
5. ✅ Test staging deployment
6. ✅ Test production deployment
7. ✅ Monitor and optimize

## Support

For deployment issues:
1. Check Cloud Build logs
2. Verify secrets configuration
3. Check Cloud Run service logs
4. Validate OAuth configuration