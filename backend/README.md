# Backend Application

**Technology Stack**: FastAPI + Python  
**Purpose**: API server, bookmarklet endpoints, AI processing pipeline  
**Deployment**: Google Cloud Run

## Setup Instructions

This directory contains the complete Neemee backend application for personal knowledge management.

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

### Development Commands

See [CLAUDE.md](CLAUDE.md) for complete development workflow documentation.

**Quick Setup:**
```bash
./scripts/dev-setup.sh      # Automated setup
./scripts/dev-server.sh     # Start with hot reload
./scripts/dev-test.sh       # Continuous testing
```

**Manual Setup:**
```bash
python3.13 -m venv .venv
source .venv/bin/activate
cp .env.example .env
pip install -r requirements.txt -r requirements-dev.txt
uvicorn src.main:app --reload --port 8000
```

**Testing:**
```bash
export ENVIRONMENT=local
python -m pytest tests/ -v
```

**Neo4j Database:**
```bash
./scripts/start-neo4j.sh    # Start database
./scripts/stop-neo4j.sh     # Stop database
# Access: http://localhost:7474
```

---
*This backend provides the AI processing pipeline foundation for Neemee's highlight management system.*