# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Cloud Run Deployment
- `./scripts/deploy-neemee.sh` - Deploy to Google Cloud Run with secrets
- `gcloud run deploy neemee-frontend --source . --region us-central1` - Manual deployment
- `gcloud services enable run.googleapis.com cloudbuild.googleapis.com` - Enable required APIs

## Project Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router and TypeScript
- **Authentication**: NextAuth.js with GitHub OAuth provider
- **Editor**: MDXEditor for enhanced markdown editing experience
- **API Integration**: GitHub REST API via Octokit for repository operations
- **Styling**: Tailwind CSS v4 with dark mode support
- **Hosting**: Google Cloud Run with buildpacks (automatic containerization)
- **Fonts**: Geist Sans and Geist Mono
- **Runtime**: Node.js 20.x

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth.js authentication
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── files/         # File management endpoints
│   │   │   ├── [filename]/
│   │   │   │   └── route.ts    # Get/update specific files
│   │   │   ├── create/
│   │   │   │   └── route.ts    # Create new files
│   │   │   └── list/
│   │   │       └── route.ts    # List repository files
│   │   ├── repo/
│   │   │   └── route.ts        # Repository information
│   │   └── test-session/
│   │       └── route.ts        # Session testing
│   ├── dashboard/         # Main application interface
│   │   └── page.tsx           # File management dashboard
│   ├── test-editor/       # Editor testing page
│   │   └── page.tsx
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Landing page with GitHub login
│   ├── globals.css        # Global styles
│   └── favicon.ico
├── components/            # Reusable React components
│   ├── CreateFileModal.tsx # New file creation modal
│   ├── FileList.tsx       # Repository file browser with resizable sidebar
│   ├── FrontmatterForm.tsx # YAML metadata form
│   ├── LoadingSpinner.tsx # Loading state components
│   ├── MarkdownEditor.tsx # MDX editor with frontmatter
│   ├── Providers.tsx      # NextAuth session provider
│   ├── SimpleMarkdownEditor.tsx # Basic markdown editor
│   ├── TestEditor.tsx     # Editor testing component
│   └── Toast.tsx          # Toast notification system
├── lib/                   # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   └── github.ts         # GitHub API client with Git Tree API
├── types/                 # TypeScript definitions
│   └── index.ts
└── styles/                # Additional styling
```

### Key Files
- `package.json` - Node.js 20.x engine specification for buildpacks
- `tsconfig.json` - TypeScript configuration with `@/*` path aliases
- `config.json` - Application configuration with app name and description
- `.env.local` - Local development environment variables

## Custom Commands Available

This repository does not currently define any custom Claude Code commands. All development workflows use standard npm scripts and git operations.

## Cloud Run Deployment

The project uses Google Cloud Run with buildpacks for automatic containerization. No Dockerfile required - buildpacks auto-detect Next.js and configure appropriately.

### Prerequisites
```bash
# Install Google Cloud CLI
# Initialize gcloud: gcloud init
# Set project: gcloud config set project YOUR_PROJECT_ID
# Enable APIs: gcloud services enable run.googleapis.com cloudbuild.googleapis.com
```

### Deployment Process
```bash
# Deploy with automated script (recommended)
./scripts/deploy-neemee.sh

# Deploy from source (buildpacks auto-detect Next.js)
gcloud run deploy neemee-frontend --source . --region us-central1 --allow-unauthenticated

# Deploy with custom settings
gcloud run deploy neemee-frontend \
  --source . \
  --region us-central1 \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 100 \
  --allow-unauthenticated
```

## Development Notes

### Current State - Enhanced MVP Complete ✅
- **Full GitHub OAuth Authentication**: NextAuth.js integration with repository permission mapping
- **Recursive File Discovery**: Git Tree API implementation for finding all .md files throughout repository
- **Resizable Sidebar**: Adjustable file list width with localStorage persistence and drag-to-resize functionality
- **Enhanced Editor**: MDXEditor with frontmatter forms, toolbar, and comprehensive language support
- **Pull Request Workflow**: Automatic branch creation and PR generation for all changes
- **Hierarchical File Organization**: Directory grouping with proper indentation and folder icons
- **Improved UX**: Hover tooltips, compact file items, and clean interface without directory clutter
- **Role-Based Access**: Owner, Maintainer, Contributor, Reader permissions
- **Toast Notifications**: User feedback system for actions and errors
- **Production Ready**: Successfully builds and deploys on Cloud Run with buildpacks

### Repository Status
- **Repository**: https://github.com/Paul-Bonneville-Labs/arrgh-collect
- **Main branch**: Deployable and tested
- **Latest Features**: Resizable sidebar, recursive file discovery, enhanced UX improvements
- **Recent PRs**: PR #8 for resizable sidebar and file list improvements
- **Deployment**: Stable production deployment on Cloud Run
- **Security**: Domain Restricted Sharing policy resolved

### Code Style
- Uses TypeScript strict mode
- Tailwind CSS for styling with dark mode support
- Next.js App Router with React 19
- Path aliases configured (`@/*` → `./src/*`)
- No external dependencies beyond Next.js core

### Build Process
- Buildpacks automatically detect Next.js
- Uses Node.js 20.x runtime (specified in package.json engines)
- Production build: `npm ci` → `npm run build` → `npm start`
- No custom configuration required
- No Dockerfile needed

### Deployment Status
- **Platform**: Google Cloud Run
- **Method**: Buildpacks (automatic containerization)
- **Public Access**: Enabled
- **Scaling**: Managed by Cloud Run
- **Cost**: Pay-per-use model
- **Live URL**: https://arrgh-collect-860937201650.us-central1.run.app
- **Build Status**: Stable with latest enhancements deployed