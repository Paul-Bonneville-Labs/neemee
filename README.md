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

## Getting Started

1. **Setup Frontend**: Navigate to `/frontend/` and follow setup instructions
2. **Setup Backend**: Navigate to `/backend/` and follow setup instructions  
3. **Configure Deployment**: Use scripts in `/deployment/` for GCP setup

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

## Phase 1 Development (Current)

Focus: Integration & Core Adaptation (2-3 weeks)
- ✅ Integrate arrgh-collect frontend with arrgh-fastapi backend
- ✅ Implement bookmarklet functionality
- ✅ Setup Auth.js v5 authentication and Prisma database
- ✅ Adapt existing components for highlight management
- ✅ Deploy backend with AI processing pipeline to Google Cloud Run
- ✅ Configure secrets management and production environment

See `/docs/` for detailed development phases and timelines.
