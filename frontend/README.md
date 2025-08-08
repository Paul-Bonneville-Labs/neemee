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
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

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
- **Supabase Authentication** - Magic link and email/password authentication
- **Highlight Management** - Create, edit, and organize web highlights
- **Bookmarklet System** - Browser bookmarklet for capturing web highlights
- **MDX Editor** - Rich text editing with frontmatter support
- **Responsive UI** - Tailwind CSS with dark mode support
- **Real-time Updates** - Live data synchronization with Supabase

### Key Components
- **AuthProvider** - Supabase authentication management
- **HighlightList** - Browse and manage captured highlights
- **MarkdownEditor** - MDX editor with frontmatter forms
- **BookmarkletModal** - Bookmarklet installation and management
- **Toast System** - User feedback and notifications

## Tech Stack

- **Framework**: Next.js 15 with App Router and TypeScript
- **Authentication**: Supabase Auth with magic links
- **Database**: Supabase (PostgreSQL) for user data and highlights
- **Editor**: MDXEditor 3.39.1 for enhanced markdown editing
- **Styling**: Tailwind CSS v4 with dark mode support
- **Runtime**: Node.js 20.x
- **Deployment**: Google Cloud Run with buildpacks

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Supabase authentication callbacks
│   │   ├── highlights/    # Highlight management endpoints
│   │   └── user/          # User management and bookmarklet
│   ├── capture/           # Highlight capture interface
│   ├── dashboard/         # Main application interface
│   └── layout.tsx         # Root layout with providers
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── HighlightList.tsx # Highlight browser and management
│   ├── MarkdownEditor.tsx # MDX editor with frontmatter
│   └── ...
├── lib/                   # Utility libraries
│   ├── auth.ts           # Supabase authentication utilities
│   └── supabase/         # Supabase client configuration
└── types/                 # TypeScript definitions
```

## Deployment

### Google Cloud Run Deployment

The frontend deploys automatically to Google Cloud Run using:

```bash
# Deploy with automatic secrets management
./scripts/deploy.sh
```

The deployment process:
1. **Secrets Sync**: Reads `.env.production` and syncs to Google Cloud Secrets
2. **Build**: Uses Cloud Build with buildpacks (no Dockerfile needed)
3. **Deploy**: Deploys to Cloud Run with secrets mounted as environment variables

### Cloud Secrets Management

Production secrets are managed via Google Cloud Secrets Manager:
- `neemee-supabase-url` ← Supabase Project URL
- `neemee-supabase-anon-key` ← Supabase Anonymous Key
- `neemee-backend-api-url` ← Backend API Service URL
- `neemee-backend-api-key` ← Backend API Authentication Key

### Prerequisites
```bash
# Install Google Cloud CLI and authenticate
# Enable required APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com
```

## Development Notes

### Current Status ✅
- **Authentication**: Complete Supabase Auth implementation
- **Highlight Management**: Full CRUD operations for highlights
- **Bookmarklet**: Dynamic URL generation for any deployment environment
- **Environment Management**: Clean separation of local vs production configuration
- **Deployment**: Streamlined Cloud Run deployment with automatic secret management
- **Code Quality**: ESLint, TypeScript, and real-time linting support

### Recent Improvements
- **Simplified Environment**: Removed GitHub integration, reduced variables by 80%
- **Dynamic URLs**: Fixed hardcoded localhost URLs with `NEXT_PUBLIC_BASE_URL`
- **Clean Deployment**: Single deployment script with automatic secret sync
- **Better Developer Experience**: Improved linting workflow and environment setup

---
*This frontend provides a complete web interface for Neemee's personal knowledge management system.*