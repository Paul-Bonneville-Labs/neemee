# Neemee - Product Requirements Document

## 1. Product Overview

### Core Philosophy: Your Data, Your Knowledge, Your Control

Neemee is fundamentally a **personal knowledge management system** built on the principle of data ownership and portability. In an era where AI tools and platforms proliferate, users face a critical challenge: their valuable context, insights, and knowledge become trapped within vendor ecosystems.

Neemee solves this by ensuring **your data belongs to you**. Every piece of text you highlight, every insight you capture, every connection you make becomes part of your personal knowledge graph that travels with you. While you may choose to share relevant context with AI providers like OpenAI or Anthropic during conversations, the core of your information remains yours and is never stored exclusively within their systems or becomes vendor-locked. Your knowledge base is portable, accessible, and under your control.

#### The Vision: Context That Follows You
- **Personal Knowledge Repository**: Build a comprehensive, searchable database of your interests, expertise, and discoveries
- **AI Tool Enhancement**: Inject your personal context into any AI conversation through MCP (Model Context Protocol) servers
- **Bidirectional Integration**: Not only provide context to AI conversations, but also allow AI interactions to write back and update your knowledge base
- **Data Portability**: Your knowledge graph belongs to you, stored in Markdown format for maximum portability and AI compatibility
- **Vendor Independence**: Never be locked into a single AI provider or knowledge platform

#### The Journey: From Highlights to Intelligence
While Phase 1 focuses on capturing and organizing highlighted text from across the web, the ultimate goal is creating a personal intelligence layer that enhances every AI interaction you have. Your collected knowledge becomes the foundation for more personalized, contextual, and valuable AI assistance.

### Product Mission
Neemee empowers users to build and own their personal knowledge ecosystem, ensuring their insights, discoveries, and expertise remain accessible and valuable across any AI tool or platform they choose to use.

### Vision
Neemee begins as a seamless web application for capturing and organizing highlighted text from any website, evolving into a comprehensive personal knowledge management system that transforms scattered insights into an intelligent, portable knowledge graph that enhances every AI interaction.

### Mission Statement
Starting with intuitive text highlighting and capture, Neemee empowers users to build and own their personal knowledge ecosystem. Through intelligent processing and AI integration, we transform collected content into a valuable personal context layer that travels with users across any AI tool or platform they choose to use.

### Target Audience
- **Knowledge Workers**: Professionals who need to synthesize information from multiple sources
- **Researchers and Students**: Academics building comprehensive knowledge bases
- **Content Creators and Writers**: Individuals gathering insights and references
- **AI Power Users**: People who want to enhance their AI conversations with personal context
- **Privacy-Conscious Users**: Individuals who want to maintain control over their data and insights
- **Cross-Platform Users**: Anyone who uses multiple AI tools and wants consistent personal context

## 2. Technical Architecture

### Frontend Foundation
- **Framework**: Next.js 15 + React 19 + TypeScript (from arrgh-collect project)
- **Editor**: MDX Editor 3.39.1 with Front Matter support (proven implementation)
- **Authentication**: Supabase Auth (replacing NextAuth from arrgh-collect)
- **Styling**: Tailwind CSS v4
- **Deployment**: Google Cloud Run (integrated with existing arrgh-fastapi deployment)

### Backend Foundation
- **Framework**: FastAPI (from arrgh-fastapi project with proven AI pipeline)
- **AI Processing**: OpenAI integration with structured entity extraction
- **Deployment**: Google Cloud Run (existing arrgh-fastapi deployment)

### Unified GCP Deployment Strategy
- **Infrastructure**: Both frontend and backend deployed on Google Cloud Platform
- **Frontend Deployment**: Next.js application deployed to Google Cloud Run alongside backend
- **Backend Deployment**: FastAPI application on existing Google Cloud Run infrastructure
- **Integration Benefits**: Single cloud provider, unified monitoring, consistent security policies
- **Existing Assets**: Leverage proven arrgh-fastapi GCP configuration and deployment pipelines

### Database & Authentication
- **Primary Database**: Supabase (PostgreSQL) for operational data (replacing GitHub storage)
- **Knowledge Graph**: Neo4j (existing implementation from arrgh-fastapi)
- **Task Queue**: Redis for asynchronous processing management
- **Authentication**: Supabase Auth (email/password, social logins)
- **Content Format**: Markdown with Front Matter for all text storage (AI-optimized, portable format)

### Content Management & Storage
- **Markdown Standard**: GitHub Flavored Markdown for maximum compatibility
- **Metadata Format**: YAML Front Matter for structured metadata
- **Editor**: MDX Editor for rich editing experience with React component support
- **HTML Conversion**: html2text library (already implemented in arrgh-fastapi)
- **Future Enhancement**: React component injection into Markdown for knowledge graph insights

### Knowledge Graph Processing (Existing Implementation)
- **Entity Extraction**: OpenAI-powered with Pydantic schemas (from arrgh-fastapi)
- **Graph Database**: Neo4j with comprehensive relationship modeling
- **Processing Pipeline**: Structured entity extraction with confidence scoring
- **HTML-to-Markdown Conversion**: BeautifulSoup + html2text (proven implementation)

### Proven Technology Assets
- **arrgh-collect Components**: 
  - Complete MDX Editor with toolbar and Front Matter editing
  - File management UI (adaptable to highlight management)
  - TypeScript interfaces for Markdown handling
  - Modern Next.js 15 architecture
- **arrgh-fastapi Components**:
  - OpenAI entity extraction with exact entity types needed (Person, Organization, Product, Event, Location, Topic)
  - Neo4j knowledge graph with relationship modeling
  - HTML processing and cleaning pipeline
  - Production-ready configuration management
  - Google Cloud deployment infrastructure

### Bookmarklet
- **Technology**: Vanilla JavaScript
- **Functionality**: Capture highlighted text, page URL, and full HTML

## 3. Core Features

### 3.1 User Authentication
- **Login/Signup**: Email and password authentication via Supabase
- **Session Management**: Persistent login sessions
- **User Profiles**: Basic user information storage

### 3.2 Bookmarklet Functionality

#### API Key Authentication System
- **API Key Generation**: Upon account creation, each user receives a unique API key automatically generated and stored in their profile
- **Personalized Bookmarklet**: The bookmarklet code displayed to users includes their embedded personal API key, eliminating the need for separate authentication during capture
- **Data Isolation**: API key ensures all captured highlights are automatically associated with the correct user account
- **Security**: API key provides secure access to user-specific endpoints without exposing session tokens

#### Text Capture Process
- **Selection Detection**: Detect and capture highlighted/selected text on any webpage
- **One-Click Activation**: User highlights text and clicks the bookmarklet to instantly save
- **Automatic Authentication**: Embedded API key authenticates the request without user intervention

#### Metadata Collection
- **Full HTML**: Complete page HTML for future reference and context
- **Page Metadata**: URL, title, and timestamp of capture
- **User Context**: Automatic user identification via embedded API key
- **Selection Context**: Position and surrounding text context of the highlight

#### Bookmarklet Distribution
- **Dynamic Code Generation**: JavaScript code is generated in real-time with user's API key embedded
- **Installation Instructions**: Clear drag-and-drop instructions for adding to browser toolbar
- **Code Display**: Formatted JavaScript code shown on user dashboard for manual installation if needed
- **Cross-Browser Compatibility**: Vanilla JavaScript ensuring compatibility across all major browsers

#### Data Transmission
- **Secure API Calls**: HTTPS-only communication to backend endpoints
- **Payload Structure**: JSON payload containing highlight text, page data, and metadata
- **Error Handling**: User-friendly notifications for network issues or API failures
- **Retry Logic**: Automatic retry mechanism for failed capture attempts

### 3.5 Knowledge Graph Processing Pipeline

#### Asynchronous Processing Flow
- **Highlight Ingestion**: Raw highlights stored immediately in PostgreSQL
- **Task Queue**: Redis-managed queue triggers background processing
- **Multi-Agent Orchestration**: LangGraph coordinates specialized agents for different extraction tasks

#### Processing Agents
- **Entity Extraction Agent**: Identifies and extracts people, organizations, topics, events, and products from highlight text using Pydantic schemas
- **Domain Research Agent**: Performs LLM-powered web research to identify organization ownership of domains and URLs
- **Relationship Inference Agent**: Establishes connections between entities based on context and co-occurrence
- **Validation Agent**: Ensures data quality and handles entity deduplication

#### Data Pipeline
1. **Immediate Storage**: Highlight saved to PostgreSQL with `processing_status: pending`
2. **Queue Processing**: Redis task queue picks up new highlights for analysis
3. **Entity Extraction**: Extract structured entities using predefined Pydantic models
4. **Graph Population**: Populate Neo4j with entities and relationships
5. **Status Update**: Mark highlight as `processing_status: completed` in PostgreSQL

#### Output & Insights
- **Entity Networks**: Visualize connections between people, organizations, and topics
- **Domain Intelligence**: Track which organizations own which websites and their focus areas
- **Content Mapping**: Understand how different topics and entities are discussed across various sources
- **Trend Analysis**: Identify emerging themes and entity relationships over time

### 3.6 Admin Interface
- **Dashboard**: Overview of all captured highlights with processing status
- **Highlight Management**: 
  - View all saved highlights with metadata
  - Search and filter highlights by URL, date, content, or processing status
  - Delete unwanted highlights
- **Page Archive**: Access to stored full HTML of captured pages
- **Processing Monitor**: View status of knowledge graph processing tasks

### 3.7 Knowledge Graph Insights (Future Enhancement)
- **Entity Exploration**: Browse and search extracted entities and their relationships
- **Domain Intelligence**: View organization profiles and their associated websites
- **Network Visualization**: Interactive graphs showing entity relationships
- **Topic Mapping**: Understand content themes and how they connect across sources

### 3.8 Landing Page & User Dashboard
- **Authentication Portal**: Login and signup forms with automatic API key generation
- **Product Information**: Brief explanation of functionality and benefits
- **Personalized Bookmarklet**: Dynamic generation and display of user-specific bookmarklet code
- **Installation Guide**: Step-by-step instructions for adding bookmarklet to browser toolbar
- **API Key Management**: Option to view (partially masked) and regenerate API key if needed

## 4. Core Principles & User Stories

### Data Ownership Principles
- **User Data Sovereignty**: All captured content, extracted entities, and knowledge graphs belong exclusively to the user
- **Export Freedom**: Users can export their complete dataset in standard formats at any time
- **Vendor Independence**: No dependency on proprietary AI platforms for core functionality
- **Privacy by Design**: Personal knowledge remains on user-controlled infrastructure
- **Interoperability**: Data structured for compatibility with multiple AI tools and platforms

### User Stories

#### Epic: Personal Knowledge Ownership
- As a user, I want to own my data completely so I'm never locked into a single platform
- As a user, I want to export my knowledge graph so I can use it with any AI tool I choose
- As a user, I want my personal context to enhance my AI conversations without sharing my data with AI companies

#### Epic: User Onboarding
- As a new user, I want to create an account so I can start building my personal knowledge base
- As a user, I want to install the bookmarklet so I can capture insights from anywhere on the web
- As a user, I want clear instructions on how to use the system effectively

#### Epic: Content Capture & Organization
- As a user, I want to highlight text on any website and save it with one click
- As a user, I want the full page context saved so I can reference the original source later
- As a user, I want my highlights automatically organized and connected through intelligent processing

#### Epic: Knowledge Discovery & Insights
- As a user, I want to search through my personal knowledge base to find specific information
- As a user, I want to discover connections between different pieces of content I've saved
- As a user, I want to see patterns and trends in my areas of interest

#### Epic: AI Integration (Future)
- As a user, I want to provide my personal context to AI tools without uploading my data to third parties
- As a user, I want AI conversations that understand my background, interests, and expertise
- As a user, I want to use my knowledge base with any AI platform I choose

## 5. Database Architecture

### PostgreSQL (Supabase) - Operational Data

#### Users Table (Managed by Supabase Auth)
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `api_key` (String, Unique, Generated on account creation)
- `api_key_created_at` (Timestamp)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### Highlights Table (Markdown-Based Storage)
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to Users)
- `title` (String, extracted from content or page title)
- `highlighted_content` (Text, Markdown format with Front Matter)
- `source_url` (String, original page URL)
- `source_title` (String, original page title)
- `source_html` (Text, archived full HTML)
- `content_format` (String, default: 'markdown')
- `processing_status` (Enum: pending, processing, completed, failed)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### Front Matter Schema for Highlights
```yaml
---
title: "Highlight Title"
source_url: "https://example.com/article"
source_title: "Original Article Title"
captured_at: "2025-07-29T10:30:00Z"
tags: ["machine-learning", "ai", "research"]
author: "user@example.com"
status: "processed"
entities_extracted: true
processing_version: "1.0"
---

# Highlighted Content

The actual highlighted text content in Markdown format...
```

### Neo4j - Knowledge Graph

#### Core Entity Types
- **Person**: Individual people mentioned or referenced
- **Organization**: Companies, institutions, government bodies
- **Topic**: Subjects, themes, concepts, technologies
- **URL**: Website domains and specific pages
- **Event**: Meetings, conferences, product launches, news events
- **Product**: Software, hardware, services, offerings

#### Relationship Types
- **WORKS_FOR**: Person → Organization
- **MENTIONS**: Highlight → Person/Organization/Product
- **DISCUSSES**: Highlight → Topic
- **SOURCES_FROM**: Highlight → URL
- **OWNS**: Organization → URL
- **PARTICIPATES_IN**: Person/Organization → Event
- **DEVELOPS**: Organization → Product
- **COVERS**: URL → Topic

## 6. API Endpoints

### Authentication (Handled by Supabase)
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Highlights Management
- `POST /api/highlights` - Create new highlight (requires session authentication for web app)
- `POST /api/bookmarklet/capture` - Create highlight via bookmarklet (requires API key authentication)
- `GET /api/highlights` - Get user's highlights (with pagination/filtering)
- `GET /api/highlights/{id}` - Get specific highlight
- `DELETE /api/highlights/{id}` - Delete highlight

### User Management
- `GET /api/user/bookmarklet-code` - Generate personalized bookmarklet code with embedded API key
- `POST /api/user/regenerate-api-key` - Regenerate user's API key (invalidates old bookmarklet)

### Knowledge Graph Processing
- `GET /api/processing/status/{highlight_id}` - Get processing status for specific highlight
- `POST /api/processing/retry/{highlight_id}` - Retry failed processing for specific highlight
- `GET /api/processing/queue-status` - Get overall queue health and statistics

### Graph Insights (Future)
- `GET /api/graph/entities` - Search and browse extracted entities
- `GET /api/graph/relationships/{entity_id}` - Get relationships for specific entity
- `GET /api/graph/domain-intelligence/{domain}` - Get organization information for domain

### Health Check
- `GET /api/health` - API health status

## 7. Security Considerations

### Data Protection
- **Dual Authentication**: Session-based auth for web app, API key auth for bookmarklet
- **API Key Security**: Unique, randomly generated API keys for each user with secure storage
- **User Data Isolation**: API keys ensure users can only access their own highlights
- **Input Validation**: Comprehensive validation and sanitization for all endpoints
- **HTTPS Enforcement**: All communications encrypted in transit

### API Key Management
- **Generation**: Cryptographically secure random API key generation on account creation
- **Storage**: API keys hashed and stored securely in database
- **Regeneration**: Users can regenerate API keys, invalidating previous bookmarklets
- **Rate Limiting**: API key endpoints protected against abuse and excessive requests

### Content Security
- **HTML Sanitization**: Stored HTML content sanitized before display to prevent XSS
- **CORS Configuration**: Proper CORS headers for secure bookmarklet functionality
- **Content Validation**: Verification of captured content integrity and size limits

## 8. Future Enhancement Opportunities

### Phase 2 Features
- **Tagging System**: Allow users to tag highlights for better organization
- **Full-Text Search**: Advanced search across highlight content
- **Export Functionality**: Export highlights to various formats (PDF, CSV, etc.)
- **Sharing**: Share individual highlights or collections with others

### Phase 3 Features: Personal AI Context Layer
- **MCP Server Integration**: Build Model Context Protocol server that provides personal knowledge context to AI conversations
- **Bidirectional Data Flow**: Allow AI conversations to not only read from but also write to and update the personal knowledge base
- **Context Injection**: Automatically provide relevant personal knowledge during AI tool interactions
- **Cross-Platform Compatibility**: Work with Claude, ChatGPT, and other AI platforms through standardized protocols
- **Knowledge Synthesis**: AI-powered summarization and connection-finding across personal knowledge base

### Phase 4 Features: Advanced Intelligence
- **AI-Powered Insights**: Automatic categorization and insights from highlights
- **Personal Knowledge Queries**: Natural language queries against personal knowledge graph
- **Trend Analysis**: Identify patterns in personal interests and knowledge evolution
- **Smart Recommendations**: Suggest new content based on personal knowledge patterns

### Phase 5 Features: Ecosystem & Collaboration
- **Browser Extension**: Full browser extension as alternative to bookmarklet
- **Collaboration**: Team workspaces and shared highlight collections (while maintaining data ownership)
- **API Access**: Public API for third-party integrations and custom tools
- **Data Migration Tools**: Import/export tools for moving between knowledge management systems

## 9. Success Metrics

### User Engagement
- Daily active users
- Number of highlights captured per user
- User retention rate
- Bookmarklet usage frequency

### Technical Performance
- API response time
- Bookmarklet success rate
- System uptime
- Highlight processing completion rate
- Average processing time per highlight
- Task queue throughput and latency

### Knowledge Graph Quality
- Entity extraction accuracy
- Relationship inference precision
- Domain research success rate
- Graph data completeness and coverage

### User Satisfaction
- User feedback scores
- Feature usage analytics
- Support ticket volume
- Processing transparency and user understanding

## 10. Development Phases

### Phase 1: Integration & Core Adaptation (2-3 weeks)
**Focus: Integrate existing projects and adapt for highlight collection**

- **Project Integration**: Combine arrgh-collect frontend with arrgh-fastapi backend
- **Database Migration**: Replace GitHub storage with Supabase PostgreSQL for user data
- **Authentication Update**: Replace NextAuth with Supabase Auth
- **UI Adaptation**: Modify file management components for highlight management
- **Bookmarklet Development**: Create bookmarklet API endpoints using existing FastAPI structure
- **Highlight Processing**: Adapt newsletter processing pipeline for web highlight capture
- **Component Reuse**: Leverage existing MDX Editor and Front Matter components

**Deliverable**: Fully functional highlight collection and review system leveraging proven components.

### Phase 2: Knowledge Graph Enhancement (1-2 weeks)
**Focus: Adapt existing AI pipeline for highlight processing**

- **Entity Processing**: Adapt existing OpenAI entity extraction for highlight content
- **Graph Schema**: Modify Neo4j schema for highlight-specific relationships
- **Processing Status**: Add highlight processing status tracking
- **Queue Integration**: Integrate Redis task queue with highlight processing
- **Monitoring**: Adapt existing processing analytics for highlights

**Deliverable**: Highlights processed through existing AI pipeline with entity extraction and knowledge graph population.

### Phase 3: Domain Intelligence Layer (2-3 weeks)
**Focus: Add domain research capabilities to existing pipeline**

- **Domain Research**: Enhance existing entity extraction with website ownership research
- **LLM Research Agent**: Add domain intelligence to existing OpenAI integration
- **Enhanced Relationships**: Expand Neo4j relationships for domain connections
- **Validation**: Add entity deduplication using existing confidence scoring

**Deliverable**: Rich knowledge graph with domain intelligence and entity relationships.

### Phase 4: User Experience & Insights (2-3 weeks)
**Focus: Create user-facing knowledge graph features**

- **Graph Query APIs**: Build on existing Neo4j client for user-facing queries
- **Entity Exploration**: Create UI for browsing extracted entities
- **Knowledge Visualization**: Add graph visualization to existing admin interface
- **Search Enhancement**: Integrate graph data with existing search capabilities

**Deliverable**: Users can explore and gain insights from their automatically-generated knowledge graph.

### Phase 5: AI Integration & Advanced Features (Ongoing)
**Focus: Personal AI context layer using existing infrastructure**

- **MCP Server Development**: Model Context Protocol server using existing FastAPI structure
- **Advanced Processing**: Enhance existing entity extraction for personal context
- **Export Tools**: Data portability using existing Markdown infrastructure
- **Browser Extension**: Enhanced capture alternative to bookmarklet

**Total Estimated Timeline: 7-11 weeks (vs. 17-22 weeks from scratch)**