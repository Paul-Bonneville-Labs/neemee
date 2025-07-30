# Backend Application

**Technology Stack**: FastAPI + Python  
**Purpose**: API server, bookmarklet endpoints, AI processing pipeline  
**Deployment**: Google Cloud Run

## Setup Instructions

This directory will contain the complete arrgh-fastapi backend application adapted for Neemee.

### Planned Components
- FastAPI framework with structured routing
- OpenAI integration for entity extraction
- Neo4j knowledge graph implementation
- HTML processing and Markdown conversion
- Bookmarklet capture endpoints
- User authentication and API key management
- Asynchronous processing with Redis task queues

### Integration Notes
- Adapt newsletter processing for web highlight input
- Add bookmarklet capture endpoints to existing router structure
- Add user/API key management using existing patterns
- Maintain existing OpenAI entity extraction pipeline
- Add Supabase configuration to existing settings

### Entity Types (Already Implemented)
- Person: Individual people mentioned or referenced
- Organization: Companies, institutions, government bodies
- Topic: Subjects, themes, concepts, technologies
- URL: Website domains and specific pages
- Event: Meetings, conferences, product launches, news events
- Product: Software, hardware, services, offerings

### Next Steps
1. Copy arrgh-fastapi source code to this directory
2. Update configuration for Supabase integration
3. Add bookmarklet-specific API endpoints
4. Adapt entity extraction for highlight processing
5. Configure GCP deployment settings

---
*This directory is currently empty and ready for the arrgh-fastapi backend integration.*
