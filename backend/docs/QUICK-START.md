# Quick Start Guide

## 🚀 New Developer Setup (30 seconds)

```bash
# Clone and set up everything automatically
git clone <repository-url>
cd neemee-backend
./scripts/setup-local.sh
```

The setup script will:
- ✅ Create `.env.local` from template
- ✅ Set up Python virtual environment
- ✅ Install dependencies (with optional notebook/dev tools)
- ✅ Start Neo4j if you want
- ✅ Give you next steps

## 📁 Project Structure

### **Dependencies** (install what you need):
```
requirements.txt              # Core runtime (API, processing)
requirements-dev.txt          # Testing (pytest, httpx)
```

### **Environment Files** (template vs actual):
```
.env.example                  # Local template (copy me!)
.env.production.example       # Production template (copy me!)
.env.local                    # Your real local config (gitignored)
.env.production              # Your real production config (gitignored)
```

## 🔧 Manual Setup

If you prefer manual setup:

```bash
# 1. Environment
cp .env.example .env.local
# Edit .env.local with your OpenAI API key

# 2. Dependencies
pip install -r requirements.txt                    # Core
pip install -r requirements-dev.txt               # + Testing

# 3. Database
./scripts/start-neo4j.sh

# 4. Run
export ENVIRONMENT=local
uvicorn src.main:app --reload --port 8000         # API
```

## 🗄️ Database Access

**Neo4j Browser**: http://localhost:7474  
**Credentials**: `neo4j` / `your-neo4j-password` (from .env.local)

## 📊 Key Commands

```bash
# Environment
export ENVIRONMENT=local                          # Set environment
./scripts/set-environment.sh local               # Check config

# Database
./scripts/start-neo4j.sh                         # Start Neo4j
./scripts/stop-neo4j.sh                          # Stop Neo4j

# Development
uvicorn src.main:app --reload --port 8000        # API server
python -m pytest tests/ -v                       # Tests
```

## 🔍 Troubleshooting

**"OpenAI API key not configured"**: Edit `.env.local` with real key  
**"Neo4j connection failed"**: Run `./scripts/start-neo4j.sh`  
**"Module not found"**: Check you're in virtual environment and installed requirements  

See `CLAUDE.md` for complete documentation.