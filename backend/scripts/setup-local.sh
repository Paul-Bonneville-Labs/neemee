#!/bin/bash

# Local Development Setup Script for Neemee Backend
# This script helps new developers get started quickly

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🚀 Setting up Neemee Backend System for local development..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo ""
    echo "📋 Creating local environment configuration..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo "✅ Copied .env.example to .env.local"
        echo "📝 Please edit .env.local and:"
        echo "   - Add your real OpenAI API key"
        echo "   - Customize other settings as needed"
    else
        echo "❌ .env.example not found!"
        exit 1
    fi
else
    echo "✅ .env.local already exists"
fi

# Check Python virtual environment
if [ ! -d ".venv" ]; then
    echo ""
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv .venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment and install dependencies
echo ""
echo "📦 Installing dependencies..."
source .venv/bin/activate

# Install core dependencies
echo "Installing core dependencies..."
pip install -r requirements.txt


echo ""
read -p "🧪 Install development/testing dependencies? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    pip install -r requirements-dev.txt
    echo "✅ Development dependencies installed"
fi

# Set environment
export ENVIRONMENT=local

# Check Neo4j setup
echo ""
echo "🗄️ Checking Neo4j setup..."
if command -v docker &> /dev/null; then
    echo "✅ Docker is available"
    echo "💡 Start Neo4j with: ./scripts/start-neo4j.sh"
    
    read -p "🚀 Start Neo4j now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ./scripts/start-neo4j.sh
    fi
else
    echo "⚠️ Docker not found. You'll need Docker to run Neo4j locally."
    echo "   Install Docker from: https://docker.com/get-started"
fi

# Show final instructions
echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env.local with your real OpenAI API key"
echo "2. Start Neo4j: ./scripts/start-neo4j.sh"
echo "3. Activate environment: source .venv/bin/activate && export ENVIRONMENT=local"
echo "4. Run API: uvicorn src.main:app --reload --port 8000"
echo ""
echo "📚 See CLAUDE.md for detailed documentation"