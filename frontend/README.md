# Neemee Frontend Application

**Technology Stack**: Next.js 15 + React 19 + TypeScript with comprehensive testing  
**Purpose**: Web application for highlight management and user dashboard with automated testing  
**Deployment**: Google Cloud Run with automated CI/CD and secrets management

## Quick Start

```bash
# 1. Clone and navigate to frontend
git clone https://github.com/Paul-Bonneville-Labs/neemee.git
cd neemee/frontend

# 2. Choose your development experience:

# 🚀 Full Development Environment (Recommended)
npm run dev:all
# Launches: App + Database + Prisma Studio + Linting + TypeScript

# ⚡ Quick Start (Minimal)
npm run dev:core  
# Launches: App + Database only

# 🖥️ Tmux Power User Setup
npm run dev:tmux
# Creates persistent split-pane development session
```

**All commands automatically handle**:
- ✅ Docker PostgreSQL database startup
- ✅ Dependencies installation/updates
- ✅ Prisma client generation
- ✅ Database migrations
- ✅ Service coordination and monitoring

## Environment Setup

The frontend uses a clean environment structure:

- **`.env.example`** - Template with placeholder values (committed to git)
- **`.env.local`** - Local development values (ignored by git)  
- **`.env.production`** - Production reference values (ignored by git)

### Required Environment Variables

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5433/database

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

Choose between **Docker (recommended)** or **Cloud SQL** for local development:

#### **Option 1: Docker Database (Recommended)**
**Benefits**: True isolation, no internet required, safe for testing migrations

```bash
# 1. Install dependencies
npm install

# 2. Set up Docker database
npm run db:local:start  # Starts PostgreSQL container

# 3. Configure environment
cp .env.local.docker .env.local
# Edit .env.local with your OAuth credentials

# 4. Set up database schema
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run migrations

# 5. Start development server
npm run dev:local:lint  # Starts database + development with live linting
```

#### **Option 2: Cloud SQL Database (Legacy)**
**Use case**: When you need shared data or backend integration

```bash
# 1. Install dependencies and start Cloud SQL proxy
npm install
./cloud_sql_proxy -instances=paulbonneville-com:us-central1:neemee-postgres-poc=tcp:5433 &

# 2. Use existing .env.local configuration (current setup)
# 3. Continue with existing workflow
```

**Local Environment Requirements:**
- Node.js 20.x
- Docker (for recommended setup) OR Google Cloud CLI (for Cloud SQL)
- Auth.js OAuth applications (Google, GitHub)
- Backend API running locally or pointing to staging

#### **Development Launcher Commands**
```bash
# 🚀 Multi-Service Launchers (Recommended)
npm run dev:all         # Full environment: App + Database + Studio + Linting + TypeScript
npm run dev:core        # Essential only: App + Database  
npm run dev:db          # Database tools: PostgreSQL + Prisma Studio
npm run dev:tmux        # Tmux session: Split-pane development environment

# 🔧 Single Service Commands
npm run dev             # App only: Complete setup + Next.js server
npm run dev:lint        # App + linting: Development server with real-time linting
npm run studio          # Database GUI: Prisma Studio with setup
npm run dev:tools       # Code quality: Linting + TypeScript watch mode

# 🗄️ Database Management
npm run db:local:start  # Start PostgreSQL container only
npm run db:local:stop   # Stop container (data preserved)
npm run db:local:reset  # Reset to clean state (data deleted)

# ⚙️ Utilities
npm run dev:setup       # Run setup without starting any servers
```

#### **🎯 Recommended Development Workflows**

**For Full Development:**
```bash
npm run dev:all
# Launches: Next.js + PostgreSQL + Prisma Studio + ESLint + TypeScript
# Perfect for: Feature development, debugging, database work
```

**For Quick Development:**
```bash
npm run dev:core  
# Launches: Next.js + PostgreSQL only
# Perfect for: UI work, quick testing, minimal resource usage
```

**For Database Work:**
```bash
npm run dev:db
# Launches: PostgreSQL + Prisma Studio
# Perfect for: Schema changes, data inspection, migrations
```

**For Advanced Users (Tmux):**
```bash
npm run dev:tmux
# Creates persistent tmux session with 4 split panes
# Perfect for: Long development sessions, service monitoring
```

#### **🖥️ Service URLs & Access**
When running development commands, services will be available at:
- **🌐 Next.js App**: http://localhost:3000
- **🔍 Prisma Studio**: http://localhost:5555  
- **🐘 PostgreSQL**: localhost:5433 (neemee_user/local_dev_password)
- **📊 Direct DB**: `docker exec -it neemee-local-postgres psql -U neemee_user -d neemee`

### 🤖 Automated CI/CD Pipeline

**Hybrid CI/CD Strategy:**

| Branch/Event | Pipeline | Validation Steps | Purpose |
|--------------|----------|------------------|---------|
| **Pull Requests** | **GitHub Actions** | Jest Tests + Coverage | Test validation |
| **Feature branches** | **Cloud Build CI** | TypeScript + ESLint + Build | Code quality checks |
| **`develop`** | **Staging Deploy** | CI validation + deployment | Testing and validation |
| **`main`** | **Production Deploy** | CI validation + deployment | Live production system |

### 🧪 Staging Deployment

**Automatic deployment to staging:**

1. **Push to `develop` branch** → Triggers automatic staging deployment
2. **Quality checks** → TypeScript + ESLint validation (Cloud Build CI)
3. **Test validation** → Jest tests run via GitHub Actions on PR
4. **Build & Deploy** → Buildpacks + Cloud Run deployment
5. **Smoke tests** → Automatic health checks
6. **Notification** → Deployment status

**Staging Environment:**
- **Frontend URL**: [https://neemee-frontend-staging-860937201650.us-central1.run.app](https://neemee-frontend-staging-860937201650.us-central1.run.app)
- **Backend URL**: [https://neemee-backend-staging-860937201650.us-central1.run.app](https://neemee-backend-staging-860937201650.us-central1.run.app)
- **Database**: `neemee-postgres-staging` Cloud SQL instance  
- **Secrets**: `neemee-staging-*` secrets in Cloud Secrets Manager
- **Deployment**: Automatic on `develop` branch pushes
- **Purpose**: QA testing, integration validation, pre-production verification

**Testing Staging:**
```bash
# Health checks
curl -I https://neemee-frontend-staging-860937201650.us-central1.run.app
curl -I https://neemee-backend-staging-860937201650.us-central1.run.app/health

# View staging logs
gcloud logs tail --follow --service=neemee-frontend-staging --region=us-central1
```

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
- **Frontend URL**: [https://neemee.paulbonneville.com](https://neemee.paulbonneville.com) (custom domain)
- **Backend URL**: [https://api.paulbonneville.com](https://api.paulbonneville.com) (custom domain)
- **Cloud Run URL**: `https://neemee-frontend-860937201650.us-central1.run.app` (direct access)
- **Database**: `neemee-postgres-prod` Cloud SQL instance
- **Secrets**: `neemee-*` secrets in Cloud Secrets Manager
- **Scaling**: Auto-scaling 0-10 instances (cost-optimized)
- **Rollback**: Automatic rollback on failed health checks

### 📋 CI/CD Pipeline Files

```bash
# GitHub Actions
.github/workflows/test.yml  # Jest test validation for PRs

# Cloud Build  
cloudbuild-ci.yaml         # TypeScript + ESLint + Build validation
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
- **Automated CI/CD Pipeline**: Replaced manual deployment scripts with Cloud Build triggers
- **Clean Architecture**: Removed all Supabase dependencies and magic link references
- **Better Developer Experience**: Improved linting workflow and environment setup
- **Enhanced Documentation**: Comprehensive environment overview and troubleshooting guides

## **Frontend Testing Plan - All Environments**

### **🏠 Local Development Testing**

#### Prerequisites Setup:
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your values (see .env.example for required variables)
npm install
npm run db:generate  # Generate Prisma client
```

#### Local Testing Commands:
```bash
# Start development server with live linting (recommended)
npm run dev:lint

# Alternative: Basic development server
npm run dev

# Quality checks before committing
npm run check        # TypeScript + ESLint
npm run build        # Production build test
```

#### Local Testing Checklist:
- [ ] App loads at `http://localhost:3000`
- [ ] Authentication works (Google/GitHub OAuth)
- [ ] Database connection established (Prisma)
- [ ] MDX Editor functions properly
- [ ] All TypeScript/ESLint checks pass

### **🧪 Staging Environment Testing**

#### Deploy to Staging:
```bash
# 1. Create develop branch (if it doesn't exist yet)
git checkout -b develop
git push -u origin develop

# 2. Create PR from current feature branch to develop
# This will trigger staging deployment via cloudbuild-staging.yaml
```

#### Staging Testing:
- **URL**: https://neemee-frontend-staging-860937201650.us-central1.run.app
- **Automatic deployment**: Triggered by pushes to `develop` branch
- **Smoke tests**: Automated health checks and content validation

### **🚀 Production Testing**

#### Deploy to Production:
```bash
# After staging validation, merge develop to main
git checkout main
git merge develop
git push origin main
# This triggers production deployment via cloudbuild-production.yaml
```

#### Production Testing:
- **URL**: https://neemee.paulbonneville.com
- **Automatic deployment**: Triggered by pushes to `main` branch
- **Health checks**: Built-in Cloud Run health monitoring

### **Testing Workflow Steps:**

1. **Start Local Development**: Run `npm run dev:lint` and test functionality
2. **Create Develop Branch**: `git checkout -b develop && git push -u origin develop`
3. **Deploy to Staging**: Create PR from feature branch → develop (auto-deploys)
4. **Test Staging**: Verify functionality at staging URL
5. **Deploy to Production**: Merge develop → main (auto-deploys)
6. **Validate Production**: Confirm production deployment works

### Integration Testing & Troubleshooting

#### **End-to-End Testing Checklist**
- [ ] **Authentication Flow**: Test Google/GitHub OAuth login
- [ ] **Highlight Capture**: Use bookmarklet on external websites
- [ ] **Backend Integration**: Verify API calls and entity extraction
- [ ] **Database Operations**: Check PostgreSQL data persistence
- [ ] **UI Responsiveness**: Test dashboard and editor functionality

#### **Common Development Issues**
- **Build Failures**: Check Node.js version (20.x required), clear `node_modules`, verify `.env.local`
- **OAuth Issues**: Verify callback URLs match environment (`localhost:3000` for local)  
- **Database Errors**: Run `npm run db:generate && npm run db:migrate`
- **API Integration**: Check `BACKEND_API_URL` and `BACKEND_API_KEY` configuration

#### **Environment-Specific Testing**
```bash
# Test local environment
curl -I http://localhost:3000
curl -I http://localhost:8000/health

# Test staging environment  
curl -I https://neemee-frontend-staging-860937201650.us-central1.run.app
curl -I https://neemee-backend-staging-860937201650.us-central1.run.app/health

# Test production environment
curl -I https://neemee.paulbonneville.com
curl -I https://api.paulbonneville.com/health
```

#### **Deployment Monitoring**
```bash
# Monitor Cloud Build deployments
gcloud builds list --limit=10

# View service logs
gcloud logs tail --follow --service=neemee-frontend --region=us-central1

# Check deployment status
gcloud run services describe neemee-frontend --region=us-central1
```

---
*This frontend provides a complete web interface for Neemee's personal knowledge management system.*