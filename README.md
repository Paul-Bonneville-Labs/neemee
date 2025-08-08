# Neemee - Personal Knowledge Management System

Neemee is a personal knowledge management system that captures and organizes highlighted text from websites, transforming scattered insights into an intelligent, portable knowledge graph.

## Repository Structure

```
neemee/
├── README.md
├── CLAUDE.md
├── backend/                     # FastAPI + Python API server
│   ├── CLAUDE.md
│   ├── README.md
│   ├── Dockerfile
│   ├── cloudbuild.yaml
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── scripts/                 # Development and deployment scripts
│   │   ├── deploy-production.sh
│   │   ├── dev-setup.sh
│   │   ├── dev-server.sh
│   │   ├── dev-test.sh
│   │   └── pre-deployment-tests.sh
│   ├── src/                     # Application source code
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── models/
│   │   ├── processors/
│   │   ├── routers/
│   │   └── graph/
│   └── tests/                   # Unit and integration tests
├── frontend/                    # Next.js 15 + React 19 web app
│   ├── CLAUDE.md
│   ├── README.md
│   ├── package.json
│   ├── cloudbuild.yaml
│   ├── scripts/                 # Frontend deployment scripts
│   └── src/                     # Next.js application
│       ├── app/
│       ├── components/
│       └── lib/
├── deployment/                  # GCP deployment configuration
│   ├── README.md
│   ├── cloudbuild-frontend.yaml
│   ├── deploy-backend.sh
│   └── deploy-frontend.sh
├── docs/                        # Project documentation
│   ├── PRD/
│   ├── SUPABASE_CONFIGURATION.md
│   └── SUPABASE_MAGIC_LINK_SETUP.md
└── types/                       # Shared TypeScript types
    └── supabase.ts
```

### **Frontend** (`/frontend/`)
- **Technology**: Next.js 15 + React 19 + TypeScript
- **Purpose**: Web application for highlight management and user dashboard
- **Deployment**: Google Cloud Run
- **Source**: Based on arrgh-collect components

### **Backend** (`/backend/`)
- **Technology**: FastAPI + Python with AI processing pipeline
- **Purpose**: API server, bookmarklet endpoints, entity extraction
- **Deployment**: Google Cloud Run with secrets management
- **Source**: Based on arrgh-fastapi with knowledge graph capabilities

### **Deployment** (`/deployment/`)
- **Purpose**: GCP configuration, Docker files, deployment scripts
- **Strategy**: Unified Google Cloud Platform deployment for both apps

### **Documentation** (`/docs/`)
- **PRD**: Product Requirements Document and functional specifications
- **Setup Guides**: Database configuration and CI/CD pipeline setup
- **Architecture**: System design and technical documentation

## Core Features

- **One-Click Capture**: Bookmarklet for highlighting text on any website
- **Knowledge Graph**: AI-powered entity extraction and relationship mapping
- **Data Ownership**: All highlights and insights belong to the user
- **AI Integration**: Personal context layer for enhanced AI conversations
- **Cross-Platform**: Works with any AI tool through open protocols

## Development

Each application (`frontend/` and `backend/`) is self-contained with its own:
- Dependencies and package management
- Configuration files
- Build and deployment processes
- Development environment setup

See individual README files in each directory for specific setup instructions.

## Technology Foundation

Neemee builds on proven components from two existing projects:
- **arrgh-collect**: Complete MDX editor, file management, Next.js architecture
- **arrgh-fastapi**: OpenAI integration, Neo4j knowledge graph, entity extraction

This approach provides 80% of required functionality and reduces development time from 17-22 weeks to 7-11 weeks.

## Deployment Strategy

- **Infrastructure**: Google Cloud Platform for both frontend and backend
- **Containers**: Docker deployment to Cloud Run
- **Database**: Google Cloud SQL PostgreSQL with Prisma ORM + Neo4j knowledge graph
- **Monitoring**: Unified GCP monitoring and logging

## Environment Overview

The Neemee system uses a **three-tier deployment strategy** with automated CI/CD pipelines:

| Environment | Status | Frontend URL | Backend URL | Database | Purpose |
|-------------|--------|--------------|-------------|----------|---------|
| **🏠 Local** | Development | `http://localhost:3000` | `http://localhost:8000` | Local PostgreSQL + Neo4j | Development & Testing |
| **🧪 Staging** | Auto-deploy on `develop` | [Staging URL](https://neemee-frontend-staging-860937201650.us-central1.run.app) | [Staging API](https://neemee-backend-staging-860937201650.us-central1.run.app) | `neemee-postgres-staging` | QA & Integration Testing |
| **🚀 Production** | Auto-deploy on `main` | [neemee.paulbonneville.com](https://neemee.paulbonneville.com) | [api.paulbonneville.com](https://api.paulbonneville.com) | `neemee-postgres-prod` | Live Production System |

### **Deployment Workflows**
- **Feature Development**: Create feature branch → Push to trigger CI validation
- **Staging Testing**: Merge to `develop` → Automatic staging deployment with smoke tests
- **Production Release**: Merge to `main` → Zero-downtime production deployment with comprehensive health checks

## New Developer Onboarding

### **Prerequisites Checklist**
Before setting up the development environment, ensure you have:

- [ ] **Node.js 20.x** installed ([Download](https://nodejs.org/))
- [ ] **Python 3.13** installed ([Download](https://www.python.org/downloads/))
- [ ] **Google Cloud CLI** installed and authenticated ([Setup Guide](https://cloud.google.com/sdk/docs/install))
- [ ] **Git** configured with SSH keys for GitHub access
- [ ] **PostgreSQL** installed locally or access to Cloud SQL staging
- [ ] **Neo4j** installed locally or access to staging instance

### **Account Setup Requirements**
- [ ] **Google Cloud Project Access**: `paulbonneville-com` project permissions
- [ ] **OAuth Applications Created**:
  - Google OAuth application for authentication
  - GitHub OAuth application for authentication
- [ ] **API Keys Obtained**:
  - OpenAI API key for entity extraction
  - Firecrawl API key for web content processing
- [ ] **Database Access**: PostgreSQL and Neo4j credentials

### **Quick Start Guide**

#### **1. Clone and Setup**
```bash
# Clone the repository
git clone https://github.com/Paul-Bonneville-Labs/neemee.git
cd neemee

# Setup frontend
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your development values
npm run db:generate && npm run db:migrate

# Setup backend (in new terminal)
cd ../backend
./scripts/dev-setup.sh  # Automated setup script
```

#### **2. Start Development Servers**
```bash
# Terminal 1: Frontend (with live linting)
cd frontend && npm run dev:lint

# Terminal 2: Backend (with hot reload)
cd backend && ./scripts/dev-server.sh

# Terminal 3: Start Neo4j (if running locally)
cd backend && ./scripts/start-neo4j.sh
```

#### **3. Validation Checklist**
- [ ] **Frontend loads** at `http://localhost:3000`
- [ ] **Backend API responds** at `http://localhost:8000/health`
- [ ] **Database connections working** (check backend logs)
- [ ] **Authentication flows** work (Google/GitHub OAuth)
- [ ] **End-to-end highlight capture** works via bookmarklet

## Getting Started

1. **Complete Onboarding**: Follow the checklist above to ensure all prerequisites are met
2. **Setup Frontend**: Navigate to `/frontend/` and follow detailed setup instructions
3. **Setup Backend**: Navigate to `/backend/` and follow detailed setup instructions  
4. **Validate Setup**: Use the validation checklist to ensure everything works end-to-end

## Custom Commands

The following custom commands are available via Claude Code for development workflow management:

- `/anthropic-status` - Check the current status of Anthropic's services using their RSS feed
- `/gcp-cost-analysis` - Analyze Google Cloud Platform costs across all projects and provide actionable insights
- `/gcp-optimize` - Analyze and automatically apply cost optimizations to Cloud Run services
- `/gh-branch-status` - Check git branch status, uncommitted changes, and associated PRs
- `/gh-new-work` - Clean up current work and start a new branch for new tasks
- `/gh-pr-merge` - Merge the current PR, delete local branch, and return to main
- `/gh-pr-review` - Check PR status, list comments, and create plan to address feedback
- `/gh-ship-it` - Commit uncommitted changes and create PR if needed
- `/gh-worktree` - Create a new git worktree in a sibling directory
- `/gh-worktrees` - Git worktree manager - shows status and provides management options
- `/ingest-web` - Fetch and summarize web resources into markdown files
- `/update-docs` - Update README.md and CLAUDE.md with current repository content and functionality

## Testing & Troubleshooting Guide

### **Integration Testing Scenarios**

#### **End-to-End Testing Workflow**
1. **Authentication Flow**: Test OAuth login with Google/GitHub
2. **Highlight Capture**: Use bookmarklet on external website
3. **Content Processing**: Verify backend entity extraction
4. **Data Storage**: Check PostgreSQL and Neo4j data persistence
5. **UI Management**: Verify highlights appear in dashboard

#### **Environment-Specific Testing**

| Test Scenario | Local | Staging | Production |
|---------------|--------|---------|------------|
| **Frontend Health** | `localhost:3000` | [Staging URL](https://neemee-frontend-staging-860937201650.us-central1.run.app) | [neemee.paulbonneville.com](https://neemee.paulbonneville.com) |
| **Backend Health** | `localhost:8000/health` | [Staging API](https://neemee-backend-staging-860937201650.us-central1.run.app/health) | [api.paulbonneville.com/health](https://api.paulbonneville.com/health) |
| **Database Connection** | Local PostgreSQL | Cloud SQL Staging | Cloud SQL Production |
| **OAuth Callback** | `localhost:3000/auth/callback` | Staging OAuth apps | Production OAuth apps |

### **Common Issues & Solutions**

#### **Local Development Issues**
- **Frontend won't start**: Check Node.js 20.x, run `npm install`, verify `.env.local`
- **Backend connection fails**: Ensure Python 3.13, activate venv, check API keys
- **Database migration errors**: Run `npm run db:generate` then `npm run db:migrate`
- **OAuth login fails**: Verify OAuth app URLs match `NEXTAUTH_URL` in `.env.local`

#### **Deployment Issues**
- **Build failures**: Check Cloud Build logs with `gcloud builds log $BUILD_ID`
- **Health check failures**: Verify secrets are properly configured in Cloud Secret Manager
- **Traffic routing issues**: Check Cloud Run revision status and traffic allocation

#### **Cross-Service Integration Issues**
- **Frontend can't reach backend**: Verify `BACKEND_API_URL` and `BACKEND_API_KEY` configuration
- **Entity extraction fails**: Check OpenAI API key and quota limits
- **Neo4j connection issues**: Verify Neo4j credentials and network connectivity

### **Monitoring & Debugging**

#### **Local Development**
```bash
# View frontend logs
cd frontend && npm run dev:lint

# View backend logs with details
cd backend && ./scripts/dev-server.sh

# Check database connections
npm run db:studio  # Open Prisma Studio
```

#### **Staging/Production Monitoring**
```bash
# View Cloud Run service logs
gcloud logs tail --follow --service=neemee-frontend --region=us-central1

# Monitor deployments
gcloud builds list --limit=10

# Check service health
curl -I https://neemee.paulbonneville.com
curl -I https://api.paulbonneville.com/health
```

### **Mixed Environment Testing**

For debugging complex issues, you can mix environments:

```bash
# Use staging backend with local frontend
BACKEND_API_URL=https://neemee-backend-staging-860937201650.us-central1.run.app

# Use production database with local development
DATABASE_URL=<staging-or-production-connection-string>
```

**⚠️ Warning**: Never use production database for development testing.

## Phase 1 Development (Current)

Focus: Integration & Core Adaptation (2-3 weeks)
- ✅ Integrate arrgh-collect frontend with arrgh-fastapi backend
- ✅ Implement bookmarklet functionality
- ✅ Setup Auth.js v5 authentication and Prisma database
- ✅ Adapt existing components for highlight management
- ✅ Deploy backend with AI processing pipeline to Google Cloud Run
- ✅ Configure secrets management and production environment

See individual component README files for detailed development phases and specific setup instructions.
