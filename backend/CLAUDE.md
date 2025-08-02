# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a production-ready FastAPI application for personal knowledge management, deployed on Google Cloud Run with custom domain mapping. The application processes web content and newsletters, extracting entities and relationships using OpenAI's GPT-4 Turbo and storing them in a Neo4j knowledge graph database.

## Key Commands

### Environment Configuration

The project uses a clean environment file structure:

```bash
# Template files (committed to repo)
.env.example                  # "Copy me for local development"

# Your actual configs (gitignored)
.env                          # Your real local development config
```

**Note**: Production configuration uses Google Cloud Secrets instead of environment files.

### Modern Development Workflow (FastAPI-First)

**Quick Setup:**
```bash
# Automated setup for complete development environment
./scripts/dev-setup.sh

# Start development server with hot reload
./scripts/dev-server.sh

# Start continuous testing (in another terminal)
./scripts/dev-test.sh

# OR start both in tmux
./scripts/dev-tmux.sh
```

**Manual Setup:**
```bash
# 1. Create and activate virtual environment
python3.13 -m venv .venv
source .venv/bin/activate  # On macOS/Linux

# 2. Copy environment template and customize
cp .env.example .env
# Edit .env with your real OpenAI API key

# 3. Install all dependencies
pip install -r requirements.txt -r requirements-dev.txt

# 4. Start development server with hot reload
uvicorn src.main:app --reload --port 8000

# 5. Start continuous testing (separate terminal)
ptw --runner "python -m pytest tests/ -v" src/ tests/
```

**📚 For detailed development workflow documentation, see: [docs/DEVELOPMENT-WORKFLOW.md](docs/DEVELOPMENT-WORKFLOW.md)**

### Local Development with Docker
```bash
# Quick development script that builds and runs Docker container
./scripts/dev-local.sh

# Or manually:
docker build -t neemee-backend .
docker run -p 8080:8080 neemee-backend
```

### Neo4j Database
```bash
# Start Neo4j database for development
./scripts/start-neo4j.sh

# Stop Neo4j database
./scripts/stop-neo4j.sh

# Access Neo4j Browser: http://localhost:7474
# Username: neo4j, Password: your-neo4j-password
```

### Dependencies

The project uses a modular dependency structure:

```bash
# Core runtime dependencies (required)
pip install -r requirements.txt

# Testing and development (optional)
pip install -r requirements-dev.txt

# Install everything for full development
pip install -r requirements.txt -r requirements-dev.txt
```

### Testing
```bash
# Install test dependencies
pip install -r requirements-dev.txt

# Run all tests
export ENVIRONMENT=local
python -m pytest tests/ -v

# Run specific test files
python -m pytest tests/test_simple.py -v
python -m pytest tests/test_newsletter.py -v

# Test newsletter processing functionality
python -m pytest tests/test_simple.py::TestHTMLProcessor -v
```

### Deployment

**Automated Deployment with Pre-Testing:**
```bash
# Verify all secrets are configured
./scripts/verify-secrets.sh

# Deploy to Google Cloud Run with automatic pre-deployment testing
./scripts/deploy-production.sh

# View deployment logs
gcloud logs tail --follow --service neemee-backend --region us-central1
```

**Pre-Deployment Testing (automatically run by deploy script):**
```bash
# Run comprehensive pre-deployment tests manually
./scripts/pre-deployment-tests.sh

# The tests include:
# - Environment and configuration validation
# - Unit tests (pytest)
# - OpenAI API connectivity testing
# - Entity extraction end-to-end testing
# - Docker build verification
# - Production health checks (if deployed)
```

**Manual Deployment (if needed):**
```bash
gcloud run deploy neemee-backend \
  --image gcr.io/paulbonneville-com/neemee-backend \
  --platform managed \
  --region us-central1 \
  --set-secrets OPENAI_API_KEY=newsletter-openai-api-key:latest \
  --set-secrets NEO4J_PASSWORD=newsletter-neo4j-password:latest \
  --set-secrets NEO4J_URI=newsletter-neo4j-uri:latest \
  --set-secrets SECRET_KEY=newsletter-secret-key:latest \
  --allow-unauthenticated
```

## Architecture

### Project Structure
- `src/main.py` - Core FastAPI application entry point
- `tests/` - Unit tests using FastAPI's TestClient
- `scripts/dev-local.sh` - Docker development automation
- Service runs on port 8080 (Google Cloud Run standard)

### Key Technical Details
- **Framework**: FastAPI with Uvicorn server
- **Python**: 3.13.5
- **Deployment**: Docker on Google Cloud Run with custom domain mapping
- **Authentication**: Public API (no authentication required)
- **AI Integration**: OpenAI GPT-4 Turbo for entity extraction
- **Database**: Neo4j graph database for entity storage
- **Content Processing**: Firecrawl for web content extraction
- **Domain**: Custom domain at `api.paulbonneville.com`

### Testing Approach
Tests use manual path manipulation to import the app. When adding new tests, follow the pattern in `tests/test_main.py`:
```python
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))
```

### Google Cloud Configuration
- **Project**: paulbonneville-com
- **Service**: neemee-backend
- **Region**: us-central1
- **Service Account**: 860937201650-compute@developer.gserviceaccount.com (default)
- **Custom Domain**: https://api.paulbonneville.com (with SSL certificate)
- **Cloud Run URL**: https://neemee-backend-860937201650.us-central1.run.app
- **Authentication**: Public access enabled (`roles/run.invoker` for `allUsers`)

## Email Processing with n8n

### n8n Workflow Integration
This FastAPI application processes emails received through an n8n workflow. The n8n workflow handles email receipt via AWS SES and calls this application's `/newsletter/process` endpoint for entity extraction.

**Integration Details:**
- **n8n Instance**: n8n.paulbonneville.com  
- **Workflow**: "Neemee Highlight Processor" (ID: cplr7F8xgOQ0lwpa)
- **API Endpoint**: `/newsletter/process` - receives email content for entity extraction
- **Authentication**: API key-based authentication for n8n workflow calls

## Important Notes

- **Public API**: The application is publicly accessible at `api.paulbonneville.com`
- **Production Ready**: Full entity extraction pipeline with OpenAI and Neo4j integration
- **Environment-Specific Features**: Some endpoints (like `/test-openai`) are only available in development
- **Docker Architecture**: Built for `linux/amd64` platform for Cloud Run compatibility
- **Secrets Management**: Production secrets managed via Google Cloud Secret Manager
- **Testing**: Comprehensive pre-deployment tests including connectivity and functionality checks
- **Domain Mapping**: Custom domain with automatic SSL certificate provisioning
- **Content Processing**: Advanced web content extraction via Firecrawl integration