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
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend (`/backend/`)
The backend directory is currently empty but will contain the adapted arrgh-fastapi application. Expected commands will be:
```bash
cd backend
# Commands will be added when backend is integrated
```

## Key Technologies

### Frontend Stack
- **Next.js 15** with React 19 and TypeScript
- **MDX Editor 3.39.1** for rich text editing with Front Matter support
- **Supabase Auth** (replacing NextAuth from arrgh-collect)
- **Tailwind CSS v4** for styling
- **Node.js 20.x** runtime

### Backend Stack (Planned)
- **FastAPI** framework with structured routing
- **OpenAI integration** for entity extraction
- **Neo4j** knowledge graph implementation
- **HTML processing** with BeautifulSoup and html2text for Markdown conversion
- **Redis** task queues for asynchronous processing
- **Supabase** PostgreSQL database

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
- **Strategy**: Unified deployment for both frontend and backend
- **Target**: Google Cloud Run containers
- **Database**: Supabase (PostgreSQL) + Neo4j knowledge graph
- **Monitoring**: GCP monitoring and logging

## Development Phases

### Phase 1 (Current): Integration & Core Adaptation (2-3 weeks)
- Integrate arrgh-collect frontend with arrgh-fastapi backend
- Implement bookmarklet functionality
- Setup Supabase authentication and database
- Adapt existing components for highlight management

## Important Integration Notes

### Frontend Adaptations Needed
- Replace NextAuth with Supabase Auth
- Replace GitHub API calls with Supabase client calls
- Adapt FileList.tsx to HighlightList.tsx
- Update terminology from "files" to "highlights"

### Backend Adaptations Needed
- Adapt newsletter processing for web highlight input
- Add bookmarklet capture endpoints to existing router structure
- Add user/API key management using existing patterns
- Maintain existing OpenAI entity extraction pipeline
- Add Supabase configuration to existing settings

## Data Flow

1. **Capture**: User highlights text on any website via bookmarklet
2. **Process**: Backend converts HTML to Markdown and extracts entities
3. **Store**: Content saved in Supabase with YAML Front Matter
4. **Graph**: Entities and relationships stored in Neo4j
5. **Interface**: User manages highlights through Next.js dashboard
6. **Export**: Data remains portable and AI-compatible

## Core Features

- One-click capture via bookmarklet
- AI-powered entity extraction and relationship mapping
- User data ownership and portability
- Cross-platform AI integration
- Knowledge graph visualization and management