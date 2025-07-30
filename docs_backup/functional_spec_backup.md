# Neemee - Functional Specification

## Document Overview

This functional specification provides detailed use cases, workflows, and implementation guidance for the Neemee personal knowledge management system. It complements the Product Requirements Document (PRD) with specific user flows, technical details, and acceptance criteria organized by development phases.

**Current Focus**: Phase 1 - Integration & Core Adaptation (2-3 weeks)
**Related Document**: [2025-07-29_initial_PRD.md](./2025-07-29_initial_PRD.md)
**Technology Foundation**: Building on proven arrgh-collect + arrgh-fastapi implementations

## Existing Technology Foundation

Neemee leverages two mature, production-ready projects that provide 80% of required functionality:

### **arrgh-collect** (Frontend Foundation)
- **Complete MDX Editor**: Full-featured editor with toolbar, Front Matter support
- **File Management UI**: List, create, edit, delete workflows (adaptable to highlights)
- **Next.js 15 + React 19**: Modern architecture with TypeScript
- **Authentication**: NextAuth implementation (to be replaced with Supabase)
- **Front Matter Integration**: YAML parsing with gray-matter library
- **Component Library**: Reusable React components for content management

### **arrgh-fastapi** (Backend Foundation)
- **FastAPI Framework**: Production-ready API with structured routing
- **OpenAI Integration**: Entity extraction with confidence scoring for exact entity types needed:
  - Person, Organization, Product, Event, Location, Topic
- **Neo4j Implementation**: Complete knowledge graph with relationship modeling
- **HTML Processing**: BeautifulSoup + html2text for Markdown conversion
- **Google Cloud Deployment**: Production-ready Cloud Run configuration
- **Configuration Management**: Comprehensive settings with environment support

### **Integration Strategy**
Instead of building from scratch, Neemee combines these proven components:
- **Frontend**: arrgh-collect → highlight management interface
- **Backend**: arrgh-fastapi → highlight processing pipeline
- **Storage**: GitHub → Supabase (user data) + existing Neo4j (knowledge graph)
- **Processing**: Newsletter pipeline → Web highlight pipeline

## Content Architecture

### Markdown-First Approach
Neemee stores all text content in **GitHub Flavored Markdown** with **YAML Front Matter** for maximum AI compatibility and data portability. This architectural decision ensures:

- **AI Optimization**: Markdown preserves structure (headers, lists, emphasis) for better LLM consumption
- **Data Portability**: Standard format easily exported/imported across platforms
- **Future Enhancement**: MDX support enables React component injection for knowledge graph insights
- **Rich Editing**: MDX Editor provides sophisticated editing experience

### HTML-to-Markdown Conversion
Captured web content undergoes intelligent conversion from HTML to Markdown:
- **Preserve Structure**: Maintain headings, lists, links, and formatting
- **Clean Output**: Remove ads, navigation, and non-content elements
- **Fallback Options**: Multiple conversion tools with LLM-powered enhancement
- **Quality Control**: Validation and cleanup of converted content

### Front Matter Schema
Standardized metadata structure for all highlights:
```yaml
---
title: "Highlight Title"
source_url: "https://example.com/article"
source_title: "Original Article Title"
captured_at: "2025-07-29T10:30:00Z"
tags: ["ai", "research"]
author: "user@example.com"
status: "processed"
entities_extracted: false
processing_version: "1.0"
---
```

### Leveraging Existing Technology
Neemee will adapt proven components from existing projects:
- **MarkdownEditor.tsx**: Full-featured MDX editor with toolbar (from arrgh-collect)
- **FrontmatterForm.tsx**: Metadata editing interface (from arrgh-collect)
- **FileList.tsx**: File management and browsing (adapt to HighlightList.tsx)
- **Entity Extraction**: OpenAI-powered processing with existing Pydantic schemas (from arrgh-fastapi)
- **Neo4j Client**: Complete knowledge graph implementation (from arrgh-fastapi)
- **HTML Processing**: BeautifulSoup + html2text conversion (from arrgh-fastapi)
- **Type Definitions**: Established TypeScript interfaces for content handling

---

## Phase 1: Integration & Core Adaptation

Focus: Combine existing arrgh-collect + arrgh-fastapi projects and adapt for highlight collection

### Key Adaptation Tasks

#### Frontend Adaptations (arrgh-collect → Neemee)
- **Authentication**: Replace NextAuth with Supabase Auth
- **Storage**: Replace GitHub API calls with Supabase client calls
- **Deployment**: Adapt arrgh-collect for Google Cloud Run deployment (unified with backend)
- **File Management → Highlight Management**: Adapt FileList.tsx to HighlightList.tsx
- **Content Creation**: Modify file creation flow for bookmarklet-captured highlights
- **UI Components**: Update terminology from "files" to "highlights"

#### Backend Adaptations (arrgh-fastapi → Neemee)
- **Input Processing**: Adapt newsletter processing for web highlight input
- **API Endpoints**: Add bookmarklet capture endpoints to existing router structure
- **User Management**: Add user/API key management using existing patterns
- **Entity Processing**: Maintain existing OpenAI entity extraction pipeline
- **Configuration**: Add Supabase configuration to existing settings

#### Database Integration
- **Supabase Setup**: Replace GitHub storage with PostgreSQL for user data
- **Neo4j Retention**: Keep existing knowledge graph implementation
- **Schema Adaptation**: Modify highlight storage to use Markdown format
- **User Isolation**: Ensure highlights are user-specific (existing pattern from newsletter processing)

### 1.1 User Registration and Onboarding

#### Use Case 1.1.1: New User Account Creation
**Primary Actor**: New User  
**Preconditions**: User has internet access and email address  
**Trigger**: User visits Neemee landing page and clicks "Sign Up"

**Main Success Scenario**:
1. User navigates to Neemee landing page
2. User clicks "Create Account" or "Sign Up" button
3. System displays registration form (email, password, confirm password)
4. User enters valid email and password (minimum 8 characters)
5. User submits registration form
6. System validates email format and password requirements
7. System creates user account in Supabase Auth
8. System automatically generates unique API key for user
9. System stores API key in user profile
10. System sends welcome email with basic instructions
11. User is redirected to dashboard with onboarding flow
12. System displays bookmarklet installation instructions

**Alternative Scenarios**:
- 6a. Invalid email format: System shows error, user corrects
- 6b. Password too weak: System shows requirements, user corrects  
- 6c. Email already exists: System shows error, offers login option

**Post-conditions**: User has active account with unique API key

#### Use Case 1.1.2: Bookmarklet Installation
**Primary Actor**: Authenticated User  
**Preconditions**: User is logged into Neemee dashboard  
**Trigger**: User completes registration or visits bookmarklet page

**Main Success Scenario**:
1. System displays personalized bookmarklet code with embedded API key
2. System shows drag-and-drop installation instructions
3. User drags bookmarklet button to browser toolbar
4. System provides alternative manual installation instructions
5. User tests bookmarklet on sample page (optional)
6. System confirms successful installation

**Post-conditions**: User has functional bookmarklet with embedded API key

### 1.2 Text Highlighting and Capture

#### Use Case 1.2.1: Highlight Text on External Website
**Primary Actor**: Authenticated User (via bookmarklet)  
**Preconditions**: User has bookmarklet installed, browsing external website  
**Trigger**: User selects text and clicks bookmarklet

**Main Success Scenario**:
1. User visits any external website (e.g., news article, blog post)
2. User selects/highlights text they want to save
3. User clicks Neemee bookmarklet in browser toolbar
4. Bookmarklet detects selected text
5. Bookmarklet captures:
   - Selected text content
   - Page URL
   - Page title
   - Full HTML of page
   - Timestamp
   - User identification via embedded API key
6. Bookmarklet sends data via HTTPS POST to `/api/bookmarklet/capture`
7. API validates API key and user authentication
8. System converts selected HTML content to GitHub Flavored Markdown
9. System generates YAML Front Matter with capture metadata
10. System creates structured Markdown document with Front Matter header
11. System saves Markdown content and metadata to PostgreSQL database
12. System archives original HTML for reference
13. System returns success response
14. Bookmarklet displays success notification to user
15. User can continue browsing or visit another page

**Alternative Scenarios**:
- 4a. No text selected: Bookmarklet shows error message
- 6a. Network failure: Bookmarklet shows retry option
- 7a. Invalid API key: Bookmarklet shows authentication error
- 8a. Database error: System shows error, offers retry

**Post-conditions**: Highlight saved to user's personal collection

**Technical Details**:
```javascript
// Bookmarklet payload structure
{
  "highlighted_text": "Selected text content",
  "page_url": "https://example.com/article",
  "page_title": "Article Title",
  "full_html": "<html>...</html>",
  "selection_context": {
    "before": "text before selection",
    "after": "text after selection"
  },
  "timestamp": "2025-07-29T10:30:00Z"
}
```

**Server Processing**:
1. **HTML-to-Markdown Conversion**: Selected HTML content converted to GitHub Flavored Markdown
2. **Front Matter Generation**: Metadata structured as YAML Front Matter
3. **Document Creation**: Combined Front Matter + Markdown content
4. **Database Storage**: Markdown document stored with metadata in PostgreSQL

**Resulting Markdown Document**:
```markdown
---
title: "Highlight from Article Title"
source_url: "https://example.com/article"
source_title: "Article Title"
captured_at: "2025-07-29T10:30:00Z"
author: "user@example.com"
status: "captured"
entities_extracted: false
---

# Selected Content

The highlighted text converted to **Markdown format** with proper formatting preserved.
```

#### Use Case 1.2.2: Handle Bookmarklet Errors
**Primary Actor**: User  
**Preconditions**: User attempts to use bookmarklet  
**Trigger**: Network error, authentication failure, or other issue

**Main Success Scenario**:
1. Bookmarklet encounters error during capture
2. System logs error details for debugging
3. Bookmarklet displays user-friendly error message
4. System offers appropriate action:
   - Network error: "Retry" button
   - Auth error: "Please log in to Neemee"
   - Server error: "Try again later"
5. User can retry operation or dismiss notification

### 1.3 Highlight Management Interface

#### Use Case 1.3.1: View All Highlights
**Primary Actor**: Authenticated User  
**Preconditions**: User is logged into Neemee dashboard  
**Trigger**: User navigates to highlights page

**Main Success Scenario**:
1. User clicks "My Highlights" in navigation
2. System queries user's highlights from database
3. System displays highlights in reverse chronological order
4. Each highlight shows:
   - Highlighted text (truncated if long)
   - Source website URL and title
   - Capture timestamp
   - "View Details" and "Delete" actions
5. System implements pagination (20 highlights per page)
6. User can click "Load More" or use pagination controls

**Post-conditions**: User sees overview of their collected highlights

#### Use Case 1.3.2: Search and Filter Highlights
**Primary Actor**: Authenticated User  
**Preconditions**: User has highlights in their collection  
**Trigger**: User wants to find specific highlights

**Main Success Scenario**:
1. User enters search term in search box
2. User optionally selects filters:
   - Date range (last week, month, year, custom)
   - Source website/domain
3. User clicks "Search" or presses Enter
4. System queries database with filters
5. System displays matching highlights
6. User can clear filters to return to full list

**Search Capabilities**:
- Full-text search across highlighted text
- Search by source URL/domain
- Filter by date range
- Sort by relevance or date

#### Use Case 1.3.3: View Highlight Details
**Primary Actor**: Authenticated User  
**Preconditions**: User has highlights, viewing highlights list  
**Trigger**: User clicks "View Details" on a highlight

**Main Success Scenario**:
1. User clicks "View Details" button
2. System displays detailed highlight view showing:
   - Full highlighted text
   - Source page URL (clickable link)
   - Page title
   - Capture timestamp
   - Option to view archived page HTML
3. User can edit personal notes (future feature)
4. User can delete highlight
5. User can return to highlights list

#### Use Case 1.3.4: View Archived Page
**Primary Actor**: Authenticated User  
**Preconditions**: User is viewing highlight details  
**Trigger**: User clicks "View Original Page"

**Main Success Scenario**:
1. User clicks "View Original Page" button
2. System retrieves stored HTML from database
3. System sanitizes HTML for safe display
4. System renders archived page in new tab/window
5. User can view page as it appeared when captured
6. System displays notice: "Archived version from [date]"

**Security Considerations**:
- HTML sanitization to prevent XSS
- Remove/disable external scripts
- External links may not work

#### Use Case 1.3.5: Delete Highlight
**Primary Actor**: Authenticated User  
**Preconditions**: User is viewing highlight  
**Trigger**: User decides to remove highlight

**Main Success Scenario**:
1. User clicks "Delete" button
2. System shows confirmation dialog: "Are you sure you want to delete this highlight?"
3. User confirms deletion
4. System removes highlight from database
5. System shows success message
6. User is returned to highlights list (highlight no longer visible)

**Alternative Scenarios**:
- 3a. User cancels: Dialog closes, no action taken

### 1.4 API Endpoints - Phase 1

#### Endpoint 1.4.1: POST /api/bookmarklet/capture
**Purpose**: Receive highlight data from bookmarklet  
**Authentication**: API key in request header

**Request Example**:
```http
POST /api/bookmarklet/capture
Authorization: Bearer sk_user_abc123xyz789
Content-Type: application/json

{
  "highlighted_text": "This is the text the user highlighted",
  "page_url": "https://example.com/article",
  "page_title": "Example Article Title", 
  "full_html": "<html>...</html>",
  "selection_context": {
    "before": "text before",
    "after": "text after"
  }
}
```

**Response Examples**:
```http
// Success
HTTP/1.1 200 OK
{
  "success": true,
  "highlight_id": "uuid-12345",
  "message": "Highlight saved successfully"
}

// Error - Invalid API key
HTTP/1.1 401 Unauthorized
{
  "success": false,
  "error": "Invalid API key"
}

// Error - Missing required fields
HTTP/1.1 400 Bad Request
{
  "success": false,
  "error": "Missing required field: highlighted_text"
}
```

#### Endpoint 1.4.2: GET /api/highlights
**Purpose**: Retrieve user's highlights with pagination and filtering  
**Authentication**: Session-based (logged-in user)

**Request Examples**:
```http
// Basic request
GET /api/highlights

// With pagination
GET /api/highlights?page=2&limit=20

// With search
GET /api/highlights?search=machine+learning

// With filters
GET /api/highlights?domain=techcrunch.com&date_from=2025-07-01
```

**Response Example**:
```http
HTTP/1.1 200 OK
{
  "highlights": [
    {
      "id": "uuid-12345",
      "highlighted_text": "Machine learning is transforming...",
      "page_url": "https://example.com/ml-article",
      "page_title": "ML Revolution",
      "created_at": "2025-07-29T10:30:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_highlights": 87,
    "has_more": true
  }
}
```

### 1.5 Database Schema - Phase 1

#### Table: users (Supabase Auth + Custom Fields)
```sql
-- Managed by Supabase Auth
id UUID PRIMARY KEY
email VARCHAR UNIQUE NOT NULL
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()

-- Custom fields
api_key VARCHAR UNIQUE NOT NULL
api_key_created_at TIMESTAMP DEFAULT NOW()
```

#### Table: highlights
```sql
CREATE TABLE highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  highlighted_text TEXT NOT NULL,
  page_url TEXT NOT NULL,
  page_title TEXT,
  full_html TEXT,
  selection_context JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_highlights_user_id ON highlights(user_id);
CREATE INDEX idx_highlights_created_at ON highlights(created_at DESC);
CREATE INDEX idx_highlights_page_url ON highlights(page_url);
CREATE INDEX idx_highlights_text_search ON highlights USING gin(to_tsvector('english', highlighted_text));
```

---

## Phase 2: Knowledge Graph Enhancement (1-2 weeks)
*Adapt existing arrgh-fastapi AI pipeline for highlight processing*

### Planned Adaptations:
- **Entity Processing**: Modify existing OpenAI entity extraction to process highlights instead of newsletters
- **Graph Schema**: Adapt existing Neo4j relationships for highlight-specific connections
- **Processing Pipeline**: Integrate existing async processing with new highlight capture
- **Monitoring**: Leverage existing processing analytics for highlight workflows

---

## Phase 3: Domain Intelligence Layer (2-3 weeks)
*Enhance existing pipeline with domain research capabilities*

### Planned Features:
- **Domain Research**: Add LLM-powered domain intelligence to existing OpenAI integration
- **Enhanced Relationships**: Expand existing Neo4j relationships for domain connections
- **Validation**: Leverage existing confidence scoring for entity deduplication

---

## Phase 4: User Experience & Insights (2-3 weeks)
*Create user-facing features using existing infrastructure*

### Planned Features:
- **Graph Queries**: Build on existing Neo4j client for user-facing APIs
- **Entity Exploration**: Create UI for browsing extracted entities
- **Visualization**: Add graph visualization to existing admin interface

---

## Phase 5: AI Integration & Advanced Features (Ongoing)
*Personal AI context layer using existing FastAPI infrastructure*

### Planned Features:
- **MCP Server**: Model Context Protocol server using existing FastAPI structure
- **Enhanced Processing**: Build on existing entity extraction for personal context
- **Export Tools**: Data portability using existing Markdown infrastructure

---

## Acceptance Criteria Template

### Phase 1 Acceptance Criteria (Integration & Adaptation)

**Project Integration**:
- [ ] arrgh-collect frontend successfully integrated with arrgh-fastapi backend
- [ ] Supabase Auth replaces NextAuth for user authentication
- [ ] Database migration from GitHub storage to Supabase completed
- [ ] Existing MDX Editor components work with new backend

**Component Adaptation**:
- [ ] FileList.tsx successfully adapted to HighlightList.tsx
- [ ] Existing Front Matter components work with highlight metadata
- [ ] Newsletter processing pipeline adapted for web highlight input
- [ ] Existing entity extraction works with highlight content

**Bookmarklet Functionality**:
- [ ] Bookmarklet API endpoints added to existing FastAPI router structure
- [ ] HTML-to-Markdown conversion using existing html2text implementation
- [ ] API key authentication integrated with existing auth patterns
- [ ] Cross-browser compatibility maintained from existing components

**Knowledge Graph Integration**:
- [ ] Existing Neo4j implementation adapted for highlight entities
- [ ] OpenAI entity extraction processes highlights successfully
- [ ] Existing confidence scoring applied to highlight entities
- [ ] Graph relationships created between highlights and entities

**Performance & Security**:
- [ ] Existing FastAPI performance maintained with new endpoints
- [ ] Existing security patterns applied to new user management
- [ ] HTML sanitization from existing pipeline prevents XSS
- [ ] Unified Google Cloud deployment works for both frontend and backend
- [ ] Single GCP infrastructure provides consistent monitoring and security
- [ ] Frontend and backend integration seamless on shared Cloud Run platform