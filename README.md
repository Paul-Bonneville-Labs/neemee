# Neemee - Personal Knowledge Management System

Neemee is a personal knowledge management system that captures and organizes highlighted text from websites, transforming scattered insights into an intelligent, portable knowledge graph.

## Project Structure

This monorepo contains independently deployable applications:

### **Frontend** (`/frontend/`)
- **Technology**: Next.js 15 + React 19 + TypeScript
- **Purpose**: Web application for highlight management and user dashboard
- **Deployment**: Google Cloud Run
- **Source**: Based on arrgh-collect components

### **Backend** (`/backend/`)
- **Technology**: FastAPI + Python
- **Purpose**: API server, bookmarklet endpoints, AI processing pipeline
- **Deployment**: Google Cloud Run  
- **Source**: Based on arrgh-fastapi with proven AI/knowledge graph features

### **Deployment** (`/deployment/`)
- **Purpose**: GCP configuration, Docker files, deployment scripts
- **Strategy**: Unified Google Cloud Platform deployment for both apps

### **Documentation** (`/docs/`)
- **PRD**: Product Requirements Document
- **Functional Spec**: Detailed use cases and technical specifications
- **Architecture**: System design and integration details

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
- **Database**: Supabase (PostgreSQL) + Neo4j knowledge graph
- **Monitoring**: Unified GCP monitoring and logging

## Getting Started

1. **Setup Frontend**: Navigate to `/frontend/` and follow setup instructions
2. **Setup Backend**: Navigate to `/backend/` and follow setup instructions  
3. **Configure Deployment**: Use scripts in `/deployment/` for GCP setup

## Phase 1 Development (Current)

Focus: Integration & Core Adaptation (2-3 weeks)
- Integrate arrgh-collect frontend with arrgh-fastapi backend
- Implement bookmarklet functionality
- Setup Supabase authentication and database
- Adapt existing components for highlight management

See `/docs/` for detailed development phases and timelines.
