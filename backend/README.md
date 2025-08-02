# Neemee Backend API

**Technology Stack**: FastAPI + Python 3.13  
**Purpose**: Personal knowledge management API with AI-powered entity extraction  
**Deployment**: Google Cloud Run with custom domain  
**Production URL**: https://api.paulbonneville.com

## Overview

Production-ready FastAPI application that processes web content and newsletters, extracting entities and relationships to build personal knowledge graphs. Features intelligent content processing with OpenAI integration and Neo4j graph database storage.

### Core Features ✅ Implemented
- **FastAPI Framework**: Structured routing with comprehensive API documentation
- **OpenAI Integration**: GPT-4 Turbo for intelligent entity extraction
- **Neo4j Knowledge Graph**: Stores entities and relationships with query capabilities
- **Content Processing**: HTML to Markdown conversion with intelligent cleaning
- **Firecrawl Integration**: Advanced web content extraction and processing
- **Newsletter Processing**: Email content analysis and entity extraction
- **Production Deployment**: Containerized deployment on Google Cloud Run
- **Custom Domain**: Public API available at `api.paulbonneville.com`
- **Environment Management**: Separate local/production configurations with Google Cloud Secrets

### Entity Types Supported
- **Person**: Individual people mentioned or referenced
- **Organization**: Companies, institutions, government bodies  
- **Topic**: Subjects, themes, concepts, technologies
- **URL**: Website domains and specific pages
- **Event**: Meetings, conferences, product launches, news events
- **Product**: Software, hardware, services, offerings

### API Endpoints

**Production API**: https://api.paulbonneville.com

- `GET /` - API information and available endpoints
- `GET /health` - Service health check
- `POST /newsletter/process` - Process newsletter content for entity extraction
- `GET /newsletter/stats` - Knowledge graph statistics
- `GET /newsletter/health` - Newsletter processing health check
- `GET /docs` - Interactive API documentation (Swagger UI)

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

**Production Deployment:**
```bash
./scripts/deploy-production.sh    # Deploy to Google Cloud Run
./scripts/verify-secrets.sh       # Verify secrets configuration
```

**Neo4j Database:**
```bash
./scripts/start-neo4j.sh    # Start database
./scripts/stop-neo4j.sh     # Stop database
# Access: http://localhost:7474
```

## Production Environment

- **Service URL**: https://api.paulbonneville.com
- **Platform**: Google Cloud Run (us-central1)
- **Authentication**: Public API (no authentication required)
- **Monitoring**: Google Cloud Logging and monitoring enabled
- **Secrets**: Managed via Google Cloud Secret Manager
- **Domain**: Custom domain mapping with SSL certificate

## Integration

### n8n Workflow Integration
The API integrates with n8n for automated email processing:
- **n8n Instance**: n8n.paulbonneville.com
- **Workflow**: "Neemee Highlight Processor"
- **Endpoint**: `POST /newsletter/process`
- **Purpose**: Automated newsletter and email content processing

---
*Production-ready personal knowledge management API with AI-powered content processing and entity extraction.*