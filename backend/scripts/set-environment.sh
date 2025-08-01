#!/bin/bash

# Environment Configuration Script for Neemee Backend
# Sets the ENVIRONMENT variable and provides feedback about configuration

set -e

ENVIRONMENT=${1:-"local"}
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🔧 Setting environment to: $ENVIRONMENT"

# Validate environment
case $ENVIRONMENT in
    local|development|staging|production)
        ;;
    *)
        echo "❌ Invalid environment: $ENVIRONMENT"
        echo "Valid options: local, development, staging, production"
        exit 1
        ;;
esac

# Export environment variable
export ENVIRONMENT=$ENVIRONMENT

# Check if corresponding .env file exists
ENV_FILE="$PROJECT_ROOT/.env.$ENVIRONMENT"
if [ -f "$ENV_FILE" ]; then
    echo "✅ Using environment file: .env.$ENVIRONMENT"
else
    echo "⚠️ Environment file .env.$ENVIRONMENT not found"
    if [ "$ENVIRONMENT" = "local" ]; then
        echo "   💡 Copy .env.example to .env.local and customize it"
        echo "   cp .env.example .env.local"
    elif [ "$ENVIRONMENT" = "production" ]; then
        echo "   💡 Copy .env.production.example to .env.production and customize it"
        echo "   cp .env.production.example .env.production"
    else
        echo "   Falling back to .env.example template"
    fi
fi

# Show configuration summary
echo ""
echo "📊 Configuration Summary:"
echo "  Environment: $ENVIRONMENT"
echo "  Config file: $(basename "$ENV_FILE")"
echo "  Project root: $PROJECT_ROOT"

# Test configuration by running Python config validation
if command -v python &> /dev/null; then
    echo ""
    echo "🔍 Validating configuration..."
    cd "$PROJECT_ROOT"
    python -c "
import os
os.environ['ENVIRONMENT'] = '$ENVIRONMENT'
from src.config import get_settings, print_configuration_summary
settings = get_settings()
print_configuration_summary(settings)
" 2>/dev/null || echo "⚠️ Could not validate configuration (missing dependencies?)"
fi

echo ""
echo "💡 To use this environment:"
echo "  export ENVIRONMENT=$ENVIRONMENT"
echo "  # or add to your shell profile:"
echo "  echo 'export ENVIRONMENT=$ENVIRONMENT' >> ~/.bashrc"
echo ""
echo "🚀 Ready to run applications with $ENVIRONMENT environment!"