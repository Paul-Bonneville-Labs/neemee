# Neemee Frontend Application

**Technology Stack**: Next.js 15 + React 19 + TypeScript  
**Purpose**: Web application for highlight management and user dashboard  
**Deployment**: Google Cloud Run with automatic secrets management

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your actual values

# 3. Start development server
npm run dev
```

## Environment Setup

The frontend uses a clean environment structure:

- **`.env.example`** - Template with placeholder values (committed to git)
- **`.env.local`** - Local development values (ignored by git)  
- **`.env.production`** - Production reference values (ignored by git)

### Required Environment Variables

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/database

# Auth.js Configuration
AUTH_SECRET=your-auth-secret-here
NEXTAUTH_URL=http://localhost:3000
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret

# Backend API Configuration  
BACKEND_API_URL=http://localhost:8000
BACKEND_API_KEY=your-backend-api-key

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

## Development Commands

### Core Development
```bash
npm run dev              # Development server with Turbopack
npm run dev:lint         # Dev server + real-time linting (recommended)
npm run build            # Production build
npm run start            # Production server
```

### Code Quality & Linting
```bash
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run lint:watch       # Watch mode for linting
npm run type-check       # TypeScript type checking
npm run type-check:watch # Watch mode for TypeScript
npm run check            # Run both TypeScript + ESLint
```

### Database Management (Prisma)
```bash
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema changes to database
npm run db:migrate       # Create and apply migration
npm run db:migrate:reset # Reset database and apply all migrations
npm run db:studio        # Open Prisma Studio (database browser)
```

### Recommended Development Workflow
```bash
# Start development with live linting (catches issues immediately)
npm run dev:lint

# Before committing changes
npm run check            # Verify no errors
npm run lint:fix         # Auto-fix what can be fixed
```

## Features & Components

### Current Implementation
- **Auth.js v5 Authentication** - Google and GitHub OAuth authentication
- **Highlight Management** - Create, edit, and organize web highlights
- **Bookmarklet System** - Browser bookmarklet for capturing web highlights
- **MDX Editor** - Rich text editing with frontmatter support
- **Responsive UI** - Tailwind CSS with dark mode support
- **Prisma ORM** - Type-safe database operations with PostgreSQL

### Key Components
- **AuthProvider** - Auth.js session management
- **HighlightList** - Browse and manage captured highlights
- **MarkdownEditor** - MDX editor with frontmatter forms
- **BookmarkletModal** - Bookmarklet installation and management
- **Toast System** - User feedback and notifications

## Tech Stack

- **Framework**: Next.js 15 with App Router and TypeScript
- **Authentication**: Auth.js v5 with Google and GitHub OAuth
- **Database**: PostgreSQL with Prisma ORM for type-safe operations
- **Editor**: MDXEditor 3.39.1 for enhanced markdown editing
- **Styling**: Tailwind CSS v4 with dark mode support
- **Runtime**: Node.js 20.x
- **Deployment**: Google Cloud Run with buildpacks

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Auth.js authentication endpoints
│   │   ├── notes/         # Note management endpoints
│   │   └── user/          # User management and bookmarklet
│   ├── auth/              # Authentication pages (signin, error)
│   ├── notes/             # Note management interface
│   └── layout.tsx         # Root layout with providers
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── NotesList.tsx     # Notes browser and management
│   ├── MarkdownEditor.tsx # MDX editor with frontmatter
│   └── ...
├── lib/                   # Utility libraries
│   ├── prisma.ts         # Prisma client configuration
│   └── api-auth.ts       # API authentication utilities
├── auth.ts                # Auth.js configuration
├── schema.prisma          # Prisma database schema
└── types/                 # TypeScript definitions
```

## Deployment

This application uses **automated CI/CD pipelines** with Google Cloud Build for reliable, consistent deployments. Manual deployment scripts have been replaced with automated triggers.

### 🏠 Local Development

For local development with hot reload and debugging:

```bash
# 1. Install dependencies
npm install

# 2. Set up local environment
cp .env.example .env.local
# Edit .env.local with your development values

# 3. Set up database
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run migrations

# 4. Start development server
npm run dev:lint        # Development with live linting (recommended)
```

**Local Environment Requirements:**
- Node.js 20.x
- PostgreSQL database (local or Cloud SQL staging)
- Auth.js OAuth applications (Google, GitHub)
- Backend API running locally or pointing to staging

### 🤖 Automated CI/CD Pipeline

**Git-Based Deployment Strategy:**

| Branch | Environment | Trigger | Purpose |
|--------|-------------|---------|---------|
| **`main`** | **Production** | Auto-deploy on push | Live production system |
| **`develop`** | **Staging** | Auto-deploy on push | Testing and validation |
| **Feature branches** | **CI Only** | Validation on PR | Code quality checks |

### 🧪 Staging Deployment

**Automatic deployment to staging:**

1. **Push to `develop` branch** → Triggers automatic staging deployment
2. **Quality checks** → TypeScript + ESLint validation
3. **Build & Deploy** → Buildpacks + Cloud Run deployment
4. **Smoke tests** → Automatic health checks
5. **Notification** → Deployment status

**Staging Environment:**
- **URL**: `https://neemee-frontend-staging-[PROJECT].us-central1.run.app`
- **Database**: `neemee-postgres-staging` Cloud SQL instance  
- **Secrets**: `neemee-staging-*` secrets in Cloud Secrets Manager
- **Deployment**: Automatic on `develop` branch pushes

### 🚀 Production Deployment

**Automatic deployment to production with safety checks:**

1. **Push to `main` branch** → Triggers automatic production deployment
2. **Comprehensive validation** → TypeScript + ESLint + Security audit
3. **Build validation** → Test Next.js production build
4. **Zero-downtime deployment** → Deploy with `--no-traffic` initially
5. **Health checks** → Comprehensive testing on candidate revision
6. **Traffic switch** → Gradual rollout with automatic rollback on failure
7. **Final validation** → Production URL health checks

**Production Environment:**
- **URL**: `https://neemee.paulbonneville.com` (custom domain)
- **Database**: `neemee-postgres-prod` Cloud SQL instance
- **Secrets**: `neemee-*` secrets in Cloud Secrets Manager
- **Scaling**: Auto-scaling 1-100 instances (always-on)
- **Rollback**: Automatic rollback on failed health checks

### 📋 CI/CD Pipeline Files

```bash
cloudbuild-ci.yaml         # CI validation for all branches/PRs
cloudbuild-staging.yaml    # Staging deployment (develop branch)
cloudbuild-production.yaml # Production deployment (main branch)
```

### 🔧 Setting Up Cloud Build Triggers

**Required one-time setup:**

```bash
# 1. Enable APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com

# 2. Grant Cloud Build permissions
PROJECT_NUM=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
CLOUD_BUILD_SA="${PROJECT_NUM}@cloudbuild.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/secretmanager.secretAccessor"

# 3. Create Cloud Build triggers
# CI Trigger: All branches → cloudbuild-ci.yaml
# Staging Trigger: develop branch → cloudbuild-staging.yaml  
# Production Trigger: main branch → cloudbuild-production.yaml
```

**Cloud Build Trigger Configuration:**

| Trigger Name | Event | Branch | Config File | Description |
|--------------|-------|--------|-------------|-------------|
| `neemee-frontend-ci` | Pull Request | `.*` | `cloudbuild-ci.yaml` | Code validation for all PRs |
| `neemee-frontend-staging` | Push to branch | `^develop$` | `cloudbuild-staging.yaml` | Staging deployment |
| `neemee-frontend-production` | Push to branch | `^main$` | `cloudbuild-production.yaml` | Production deployment |

### 🔧 Environment Configuration

| Aspect | Local | Staging | Production |
|--------|-------|---------|------------|
| **Database** | Local PostgreSQL | `neemee-postgres-staging` | `neemee-postgres-prod` |
| **Secrets** | `.env.local` file | `neemee-staging-*` secrets | `neemee-*` secrets |
| **OAuth Apps** | Development apps | Staging apps | Production apps |
| **Deployment** | Manual (`npm run dev`) | Auto (`develop` branch) | Auto (`main` branch) |
| **URL** | `http://localhost:3000` | Staging Cloud Run URL | `https://neemee.paulbonneville.com` |
| **SSL/HTTPS** | HTTP (local) | HTTPS (managed) | HTTPS (managed) |

### 📊 Monitoring Deployments

```bash
# View Cloud Build history
gcloud builds list --limit=10

# View specific build logs
gcloud builds log $BUILD_ID

# View Cloud Run deployments
gcloud run services list --region=us-central1

# View service logs
gcloud logs tail --follow --service=neemee-frontend --region=us-central1
```

### 🚨 Deployment Rollback

**Automatic rollback** occurs if production health checks fail. **Manual rollback:**

```bash
# List recent revisions
gcloud run revisions list --service=neemee-frontend --region=us-central1

# Rollback to specific revision  
gcloud run services update-traffic neemee-frontend \
  --to-revisions=[REVISION-NAME]=100 \
  --region=us-central1
```

### ✅ Benefits of Automated Pipeline

- **✅ Reliability**: No local environment dependencies or human errors
- **✅ Consistency**: Same build process every time  
- **✅ Speed**: Parallel builds with optimized caching
- **✅ Safety**: Automatic health checks and rollbacks
- **✅ Visibility**: Complete deployment history and logging
- **✅ Security**: Secrets managed entirely in Google Cloud
- **✅ Zero-downtime**: Blue-green deployments with traffic switching

### Cloud Secrets Management

Secrets are automatically managed via Google Cloud Secrets Manager with environment-specific naming:

#### Production Secrets (`neemee-*`)
- `neemee-database-url` ← PostgreSQL Connection String
- `neemee-auth-secret` ← Auth.js Session Secret  
- `neemee-google-oauth-id` ← Google OAuth Client ID
- `neemee-google-oauth-secret` ← Google OAuth Client Secret
- `neemee-github-oauth-id` ← GitHub OAuth Client ID
- `neemee-github-oauth-secret` ← GitHub OAuth Client Secret
- `neemee-backend-api-url` ← Backend API Service URL
- `neemee-backend-api-key` ← Backend API Authentication Key

#### Staging Secrets (`neemee-staging-*`)
- `neemee-staging-database-url` ← Staging PostgreSQL Connection String
- `neemee-staging-auth-secret` ← Staging Auth.js Session Secret
- `neemee-staging-google-oauth-id` ← Staging Google OAuth Client ID
- `neemee-staging-google-oauth-secret` ← Staging Google OAuth Client Secret  
- `neemee-staging-github-oauth-id` ← Staging GitHub OAuth Client ID
- `neemee-staging-github-oauth-secret` ← Staging GitHub OAuth Client Secret
- `neemee-staging-backend-api-url` ← Staging Backend API Service URL
- `neemee-staging-backend-api-key` ← Staging Backend API Authentication Key

### Prerequisites
```bash
# Install Google Cloud CLI and authenticate
# Enable required APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com
```

## Development Notes

### Current Status ✅
- **Authentication**: Complete Auth.js v5 implementation with Google and GitHub OAuth
- **Note Management**: Full CRUD operations for notes with Prisma ORM
- **Bookmarklet**: Dynamic URL generation for any deployment environment
- **Environment Management**: Clean separation of local vs production configuration
- **Deployment**: Streamlined Cloud Run deployment with automatic secret management
- **Code Quality**: ESLint, TypeScript, and real-time linting support

### Recent Improvements
- **Auth.js v5 Migration**: Replaced Supabase with Auth.js and Prisma for better type safety
- **OAuth Integration**: Google and GitHub authentication with proper session management
- **Database Modernization**: Migrated to PostgreSQL with Prisma ORM
- **Clean Architecture**: Removed all Supabase dependencies and magic link references
- **Better Developer Experience**: Improved linting workflow and environment setup

---
*This frontend provides a complete web interface for Neemee's personal knowledge management system.*