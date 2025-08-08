# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Neemee is a personal knowledge management system that captures and organizes highlighted text from websites, transforming scattered insights into an intelligent, portable knowledge graph. The system is built as a monorepo with independently deployable applications.

## Architecture

This is a **monorepo** with three main components:
- **Frontend** (`/frontend/`): Next.js 15 + React 19 + TypeScript web application
- **Backend** (`/backend/`): FastAPI + Python API server with AI processing pipeline  
- **Deployment** (`/deployment/`): Google Cloud Platform configuration and deployment scripts

### Technology Foundation

The project builds on two proven existing codebases:
- **arrgh-collect**: Provides the frontend foundation (MDX editor, file management UI, Next.js architecture)
- **arrgh-fastapi**: Provides the backend foundation (FastAPI, OpenAI integration, Neo4j knowledge graph, entity extraction)

This approach provides 80% of required functionality and reduces development time significantly.

## Development Commands

### Frontend (`/frontend/`)
```bash
cd frontend

# Environment Setup
cp .env.example .env.local    # Create local development environment
# Edit .env.local with your actual values

# Development
npm run dev          # Start development server with Turbopack
npm run dev:lint     # Start development with real-time linting
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run check        # Run TypeScript + ESLint checks

# Deployment
./scripts/deploy.sh  # Deploy to Google Cloud Run with automatic secrets
```

### Backend (`/backend/`)
```bash
cd backend

# Development Environment Setup
./scripts/dev-setup.sh       # Automated setup for complete development environment
./scripts/dev-server.sh      # Start development server with hot reload
./scripts/dev-test.sh        # Start continuous testing
./scripts/dev-tmux.sh        # Start both server and tests in tmux

# Manual Development Setup
python3.13 -m venv .venv
source .venv/bin/activate
cp .env.example .env         # Then customize with real API keys
pip install -r requirements.txt -r requirements-dev.txt
uvicorn src.main:app --reload --port 8000

# Testing
python -m pytest tests/ -v
python -m pytest tests/test_simple.py -v

# Deployment
./scripts/verify-secrets.sh          # Verify all secrets are configured
./scripts/deploy-production.sh       # Deploy to Google Cloud Run with pre-testing
./scripts/pre-deployment-tests.sh    # Run comprehensive pre-deployment tests manually

# Local Docker Development
./scripts/dev-local.sh       # Quick development script with Docker

# Neo4j Database
./scripts/start-neo4j.sh     # Start Neo4j database for development
./scripts/stop-neo4j.sh      # Stop Neo4j database
# Access Neo4j Browser: http://localhost:7474 (Username: neo4j)
```

## Key Technologies

### Frontend Stack
- **Next.js 15** with React 19 and TypeScript
- **MDX Editor 3.39.1** for rich text editing with Front Matter support
- **Auth.js v5** with Google and GitHub OAuth authentication
- **Prisma ORM** for type-safe PostgreSQL database operations
- **Tailwind CSS v4** for styling
- **Node.js 20.x** runtime

### Backend Stack (Implemented)
- **FastAPI** framework with structured routing
- **OpenAI integration** for entity extraction with GPT-4 Turbo
- **Neo4j** knowledge graph implementation with 5.28.1 driver
- **HTML processing** with BeautifulSoup and html2text for Markdown conversion
- **Firecrawl** for intelligent web content extraction
- **Google Cloud integration** with secrets management and logging
- **Pydantic settings** with environment-specific configuration
- **Comprehensive testing** with pytest and pre-deployment validation

### Entity Types
The system extracts and manages these entity types:
- Person: Individual people mentioned or referenced
- Organization: Companies, institutions, government bodies
- Topic: Subjects, themes, concepts, technologies
- URL: Website domains and specific pages
- Event: Meetings, conferences, product launches, news events
- Product: Software, hardware, services, offerings

## Content Architecture

### Markdown-First Approach
All content is stored in **GitHub Flavored Markdown** with **YAML Front Matter** for:
- AI optimization (preserves structure for better LLM consumption)
- Data portability (standard format easily exported/imported)
- Future MDX support for React component injection
- Rich editing experience

### HTML-to-Markdown Conversion
Web content is intelligently converted from HTML to Markdown maintaining structure and formatting.

## Deployment Strategy

- **Platform**: Google Cloud Platform
- **Strategy**: Automated CI/CD with Google Cloud Build triggers
- **Target**: Google Cloud Run containers using buildpacks
- **Database**: Google Cloud SQL PostgreSQL + Neo4j knowledge graph
- **Monitoring**: GCP monitoring and logging

## Development Status

### ✅ Phase 1 Complete: Integration & Core Implementation
- ✅ **Frontend-Backend Integration**: Complete integration with automated CI/CD deployment
- ✅ **Bookmarklet System**: Full implementation with dynamic URL support
- ✅ **Auth.js v5 Authentication**: Google and GitHub OAuth with session management
- ✅ **Highlight Management**: Complete CRUD system with Prisma ORM and entity extraction
- ✅ **Automated CI/CD Pipeline**: Replaced manual deployment scripts with Cloud Build triggers

## Important Integration Notes

### Frontend Implementation Status ✅
- ✅ **Complete**: Auth.js v5 integration with Google and GitHub OAuth
- ✅ **Complete**: Highlight management system with Prisma ORM
- ✅ **Complete**: Terminology updated throughout application
- ✅ **Complete**: Bookmarklet system with dynamic URL generation
- ✅ **Complete**: Automated CI/CD pipeline with Cloud Build triggers

### Backend Integration Status ✅
- ✅ **Complete**: Web highlight processing and storage
- ✅ **Complete**: Bookmarklet capture endpoints
- ✅ **Complete**: User/API key management system
- ✅ **Complete**: OpenAI entity extraction pipeline
- ✅ **Complete**: PostgreSQL database with Prisma schema

## Data Flow

1. **Capture**: User highlights text on any website via bookmarklet
2. **Process**: Backend converts HTML to Markdown and extracts entities
3. **Store**: Content saved in PostgreSQL via Prisma with YAML Front Matter
4. **Graph**: Entities and relationships stored in Neo4j
5. **Interface**: User manages highlights through Next.js dashboard
6. **Export**: Data remains portable and AI-compatible

## Recent Architecture Improvements

### Environment Management Overhaul ✅
- **Simplified Configuration**: Reduced environment variables by 80%
- **Clean Structure**: `.env.example` (template), `.env.local` (dev), `.env.production` (prod reference)
- **Secure Secrets**: Proper .gitignore, Google Cloud Secrets integration
- **Dynamic URLs**: Fixed hardcoded localhost with `NEXT_PUBLIC_BASE_URL`

### Database Migration Complete ✅
- **Supabase to Prisma Migration**: Complete migration from Supabase to Prisma ORM
- **Cost Optimization**: Reduced database costs by ~70% using Google Cloud SQL
- **Type Safety**: Enhanced type safety with Prisma generated types
- **Performance**: Improved query performance with Prisma optimizations

### Automated CI/CD Pipeline ✅
- **Manual Scripts Eliminated**: Replaced 7 unreliable deployment scripts with automated triggers
- **Cloud Build Integration**: Automated CI validation, staging, and production deployments
- **Git-Based Workflows**: PR validation, develop→staging, main→production deployments
- **Zero-Downtime Deployments**: Health checks and automatic rollbacks for production

## Current System Status

**✅ Production Ready**: Complete end-to-end highlight capture and management system
- **Frontend**: Next.js app with automated CI/CD deployment on Cloud Run
- **Backend**: FastAPI service with OpenAI entity extraction and Neo4j graph
- **Database**: Google Cloud SQL PostgreSQL with Prisma ORM, Neo4j for knowledge graph
- **Authentication**: Auth.js v5 with Google and GitHub OAuth
- **Deployment**: Automated Cloud Build pipeline with zero-downtime deployments

## Custom Commands Available

The following custom commands are available via Claude Code for enhanced development workflow:

### `/anthropic-status`
Check the current operational status of Anthropic's services by fetching and parsing their official status RSS feed. Provides:
- Overall system status (Operational/Degraded/Outage)
- Current incidents or maintenance notifications
- Recent status updates (last 24-48 hours)
- Individual service component status (Claude API, Web Interface, etc.)

### `/gcp-cost-analysis`
Comprehensive Google Cloud Platform cost analysis tool that:
- Analyzes Cloud Run costs across all projects
- Provides detailed breakdown by project, service, region
- Estimates daily/monthly costs and resource utilization
- Identifies cost optimization opportunities
- Shows top cost drivers and potential savings

### `/gcp-optimize`
Automated Google Cloud Platform optimization tool that:
- Analyzes resource utilization vs allocation for Cloud Run services
- Right-sizes CPU and memory based on actual usage patterns
- Optimizes scaling configurations (min/max instances)
- Reduces always-on costs for low-traffic services
- Implements regional cost optimization
- Applies changes gradually with safety measures and rollback capabilities

### `/gh-branch-status`
Displays comprehensive git branch status information:
- Current branch name and tracking information
- Uncommitted changes summary
- Associated pull request details
- Working directory commit status

### `/gh-new-work`
Workflow management command that:
- Cleans up current work by committing uncommitted changes
- Checks for existing PRs and offers to create one if needed
- Prompts for new work description
- Creates appropriately named branch for new tasks

### `/gh-pr-merge`
Streamlined PR merge workflow that:
- Finds and merges the open PR for current branch
- Switches back to main branch
- Pulls latest changes
- Deletes the merged local branch
- Requires existing open PR and GitHub CLI authentication

### `/gh-pr-review`
Comprehensive PR review analysis tool that:
- Fetches PR comments and review feedback
- Categorizes feedback (code changes, questions, suggestions, blockers)
- Creates specific action plan with file locations and complexity estimates
- Presents organized summary of required changes
- Asks for approval before implementing changes

### `/gh-ship-it`
Quick commit and PR creation workflow:
- Prevents commits to main branch (creates new branch if needed)
- Commits any uncommitted changes with appropriate messaging
- Creates PR for committed work if one doesn't exist
- Provides status summary of actions taken

### `/gh-worktree`
Creates new git worktree in sibling directory:
- Validates worktree name (alphanumeric and hyphens only)
- Creates new branch with `feature/` prefix
- Sets up worktree in `{project-name}-{worktree-name}` directory
- Switches to new worktree location
- Handles conflicts and errors gracefully

### `/gh-worktrees`
Interactive git worktree manager for `.worktrees/` folder:
- Lists existing worktrees with status information
- Provides menu-driven interface for worktree operations
- Creates, opens, and removes worktrees with validation
- Integrates with Claude Code for seamless development workflow
- Uses organized `.worktrees/` subdirectory approach

### `/ingest-web`
Web content ingestion and summarization tool:
- Fetches content from provided URLs using WebFetch
- Creates structured markdown files with metadata
- Generates comprehensive bulleted summaries
- Includes update history tracking
- Saves files with descriptive kebab-case names

### `/update-docs`
Repository documentation maintenance command:
- Scans custom commands directory for current command list
- Updates README.md with repository structure and command descriptions
- Updates CLAUDE.md with detailed command information and usage examples
- Maintains clean section boundaries and avoids duplications
- Extracts descriptions from YAML frontmatter and file content

## Automated CI/CD Pipeline

The project now uses a **production-grade automated CI/CD pipeline** that replaces unreliable manual deployment scripts:

### **🔧 Triggers & Workflows**
- **`neemee-frontend-ci`**: Pull request validation (TypeScript + ESLint + build verification)
- **`neemee-frontend-staging`**: Auto-deploy to staging environment on `develop` branch push
- **`neemee-frontend-production`**: Zero-downtime production deployment on `main` branch push

### **🚀 Pipeline Benefits**
- **Reliability**: No local environment dependencies or human errors
- **Speed**: Parallel builds using optimized `E2_HIGHCPU_8` machines
- **Safety**: Automatic health checks and rollbacks for production
- **Cost-Optimized**: Cloud Run settings match previous fine-tuned resource allocation
- **Audit Trail**: Complete deployment history and logging via Cloud Build

### **📁 Configuration Files**
- `frontend/cloudbuild-ci.yaml` - CI validation configuration
- `frontend/cloudbuild-staging.yaml` - Staging deployment with buildpacks
- `frontend/cloudbuild-production.yaml` - Production deployment with safety checks

## Core Features

- One-click capture via bookmarklet
- AI-powered entity extraction and relationship mapping
- User data ownership and portability
- Cross-platform AI integration
- Knowledge graph visualization and management
- Automated CI/CD deployment pipeline
- Cost-optimized infrastructure with proper resource allocation