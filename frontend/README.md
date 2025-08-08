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

This application supports three environments: **Local Development**, **Staging**, and **Production**. Each has its own configuration and deployment process.

### 🏠 Local Development

For local development with hot reload and debugging:

```bash
# 1. Install dependencies
npm install

# 2. Set up local environment
cp .env.example .env.local
# Edit .env.local with your development values

# 3. Set up local database (if using local PostgreSQL)
# Option A: Use local PostgreSQL
createdb neemee_development
npm run db:migrate

# Option B: Connect to Cloud SQL staging database
./scripts/setup-staging-db.sh  # Creates staging database
# Update DATABASE_URL in .env.local to staging connection

# 4. Start development server
npm run dev              # Standard development
npm run dev:lint         # Development with live linting (recommended)
```

**Local Environment Requirements:**
- Node.js 20.x
- PostgreSQL database (local or Cloud SQL staging)
- Auth.js OAuth applications (Google, GitHub)
- Backend API running locally or pointing to staging

### 🧪 Staging Environment

Staging provides production-like testing with separate database and secrets:

```bash
# 1. Set up staging infrastructure
./scripts/setup-staging-db.sh     # Creates Cloud SQL staging instance

# 2. Configure staging environment
cp .env.example .env.staging
# Edit .env.staging with staging-specific values

# 3. Deploy to staging
./scripts/deploy.sh staging       # Deploys to staging environment
```

**Staging Environment Features:**
- **Database**: `neemee-postgres-staging` Cloud SQL instance
- **URL**: `https://neemee-frontend-staging-[PROJECT].us-central1.run.app`
- **Secrets**: Separate staging secrets in Cloud Secrets Manager
- **OAuth**: Separate staging OAuth applications
- **Backend**: Connected to staging backend API

### 🚀 Production Environment

Production deployment with full security and performance optimizations:

```bash
# 1. Configure production environment  
cp .env.example .env.production
# Edit .env.production with production values

# 2. Deploy to production
./scripts/deploy.sh production    # Deploys to production environment
```

**Production Environment Features:**
- **Database**: `neemee-postgres-prod` Cloud SQL instance  
- **URL**: `https://neemee.paulbonneville.com` (custom domain)
- **Secrets**: Production secrets in Cloud Secrets Manager
- **OAuth**: Production OAuth applications with verified domains
- **Scaling**: Auto-scaling 0-100 instances based on traffic
- **SSL**: Automatic HTTPS with managed certificates

### 🔧 Environment Configuration Comparison

| Aspect | Local | Staging | Production |
|--------|-------|---------|------------|
| **Database** | Local PostgreSQL or Staging Cloud SQL | `neemee-postgres-staging` | `neemee-postgres-prod` |
| **Environment File** | `.env.local` | `.env.staging` | `.env.production` |
| **Secrets** | Local file | `neemee-staging-*` secrets | `neemee-*` secrets |
| **OAuth Apps** | Development apps | Staging apps | Production apps |
| **Backend URL** | `http://localhost:8000` | Staging backend URL | Production backend URL |
| **Base URL** | `http://localhost:3000` | Staging Cloud Run URL | `https://neemee.paulbonneville.com` |
| **SSL/HTTPS** | HTTP (local) | HTTPS (managed) | HTTPS (managed) |

### Google Cloud Run Deployment Details

All environments use Google Cloud Run with buildpacks (no Dockerfile needed):

```bash
# Deploy with automatic secrets management
./scripts/deploy.sh [environment]  # environment: staging or production (default)
```

**The deployment process:**
1. **Environment Detection**: Reads appropriate `.env.[environment]` file
2. **Secrets Sync**: Creates/updates Google Cloud Secrets from environment file  
3. **Build**: Uses Cloud Build with buildpacks for automatic containerization
4. **Deploy**: Deploys to Cloud Run with secrets mounted as environment variables
5. **Verification**: Confirms deployment success and provides service URLs

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