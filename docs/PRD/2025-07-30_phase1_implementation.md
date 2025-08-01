# Neemee - Phase 1 Implementation Plan

## Document Overview

This implementation plan provides detailed technical guidance for Phase 1 of the Neemee personal knowledge management system. It focuses on creating a frontend-first MVP with bookmarklet capture functionality using Next.js API routes and Supabase integration.

**Phase**: Phase 1 - Frontend MVP with Bookmarklet Capture (10-12 days)  
**Related Documents**: 
- [2025-07-29_initial_PRD.md](./2025-07-29_initial_PRD.md)
- [2025-07-29_functional_spec.md](./2025-07-29_functional_spec.md)

**Technology Foundation**: Building on proven arrgh-collect Next.js architecture with Supabase backend

## Current State Analysis

### Available Assets
- ✅ **Frontend Foundation**: Complete Next.js 15 + React 19 structure in `/frontend/`
- ✅ **Component Library**: MDX Editor, FileList, FrontmatterForm from arrgh-collect
- ✅ **API Pattern**: Existing `/api/files/` routes demonstrate Supabase integration pattern
- ✅ **Authentication Structure**: NextAuth implementation ready for Supabase migration
- ✅ **UI/UX Foundation**: Tailwind CSS, responsive design, dark mode support

### Critical Gaps
- **Authentication Migration**: NextAuth + GitHub OAuth → Supabase Auth transition needed
- **Database Integration**: Supabase project setup and highlights table creation
- **API Routes**: Need `/api/highlights/` endpoints following existing `/api/files/` pattern
- **Component Adaptation**: FileList → HighlightList for highlight-specific data display
- **Bookmarklet Generation**: User dashboard needs API key management and bookmarklet creation

## Phase 1 Work Scope

### **Core Work Areas**

#### 1. Supabase Authentication Migration
**Objective**: Replace NextAuth + GitHub OAuth with Supabase Auth

**Database Setup**:
- Create Supabase project and configure PostgreSQL database
- Set up authentication settings (email/password)
- Implement database schema for user profiles and highlights

**Frontend Migration**:
- Remove NextAuth dependencies and configuration
- Install and configure Supabase client
- Update authentication components and session management
- Test user registration and login flows

**Database Schema**:
```sql
-- User profiles with API keys
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key VARCHAR UNIQUE NOT NULL,
  api_key_created_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Highlights storage
CREATE TABLE highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  highlighted_text TEXT NOT NULL,
  page_url TEXT NOT NULL,
  page_title TEXT,
  full_html TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. Highlights API Routes
**Objective**: Create Next.js API routes following existing `/api/files/` pattern

**API Structure**:
```bash
src/app/api/
├── highlights/
│   ├── capture/route.ts     # POST - Bookmarklet capture endpoint
│   ├── list/route.ts        # GET - List user's highlights
│   └── [id]/route.ts        # GET/DELETE - Individual highlight operations
└── user/
    ├── api-key/route.ts     # GET/POST - API key management
    └── bookmarklet/route.ts # GET - Generate personalized bookmarklet
```

**Key Features**:
- API key authentication for bookmarklet submissions
- Automatic API key generation on user registration
- Secure highlight data validation and storage
- Personalized bookmarklet JavaScript code generation
- User profile and API key management

#### 3. Bookmarklet Implementation
**Objective**: Create JavaScript bookmarklet for text capture

**Bookmarklet Features**:
- Capture selected text from any website
- Send page URL, title, and full HTML to API
- Embedded API key for user authentication
- Cross-browser compatibility (Chrome, Firefox, Safari)
- User-friendly success/error feedback

**Dashboard Integration**:
- Generate personalized bookmarklet code with user's API key
- Provide drag-and-drop installation instructions
- API key management and regeneration
- Clear installation and usage guidance

**Technical Requirements**:
- Proper CORS configuration for cross-origin requests
- Secure API key transmission
- Error handling for network failures
- Validation for empty selections and edge cases

#### 4. Component Adaptation (FileList → HighlightList)
**Objective**: Adapt existing FileList component for highlight management

**HighlightList Component**:
- Update terminology from "files" to "highlights"
- Display highlight previews with source URL and page title
- Include capture timestamps and metadata
- Maintain existing resizable sidebar and responsive design

**Search and Filter Functionality**:
- Search across highlight text content
- Filter by source domain/URL and date range
- Sort by recency or relevance
- Maintain existing UI patterns and dark mode support

**Highlight Management**:
- View full highlight details
- Delete highlights with confirmation
- Copy highlight text to clipboard
- Open source URLs in new tabs
- Handle loading states and error conditions

**API Integration**:
- Connect to `/api/highlights/list` endpoint
- Implement CRUD operations via API routes
- Add optimistic updates for better UX
- Handle pagination for large collections

## Technical Architecture

### **Single Application Approach**
- **Framework**: Next.js 15 with App Router and React 19
- **Authentication**: Supabase Auth (replaces NextAuth + GitHub)
- **API**: Next.js API routes (replaces separate FastAPI backend)
- **Database**: Supabase PostgreSQL
- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Deployment**: Google Cloud Run (existing setup)

### **What's Deferred to Phase 2**
- FastAPI backend with AI processing pipeline
- HTML-to-Markdown conversion (store raw HTML for now)
- Entity extraction and knowledge graph population
- Neo4j integration and relationship modeling
- Advanced processing and analytics features

## Success Criteria for Phase 1

### **Core Functionality**
- [ ] User can register and login with Supabase Auth (no GitHub dependency)
- [ ] User receives API key automatically on registration
- [ ] User gets personalized bookmarklet from dashboard
- [ ] Bookmarklet captures text and saves via Next.js API route
- [ ] HighlightList displays captured highlights with search/filter
- [ ] Users can view highlight details and delete highlights

### **Technical Integration**
- [ ] NextAuth completely replaced with Supabase Auth
- [ ] All API routes follow existing `/api/files/` patterns
- [ ] Database operations work correctly with Supabase
- [ ] Component adaptation maintains existing UI/UX quality
- [ ] Responsive design and dark mode support preserved

### **User Experience**
- [ ] End-to-end workflow: registration → bookmarklet → capture → view
- [ ] Cross-browser bookmarklet compatibility (Chrome, Firefox, Safari)
- [ ] Clear error handling and user feedback
- [ ] Performance comparable to existing file management system

## Implementation Priority

This Phase 1 scope delivers a complete, working highlight capture and management system using only the Next.js frontend architecture. It provides the essential user experience while building a solid foundation for Phase 2's advanced AI processing features.