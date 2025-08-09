#!/bin/bash
# Tmux Development Session for Neemee Frontend
# Creates a persistent development session with split panes for all services

set -e

SESSION_NAME="neemee-dev"

# Check if tmux is installed
if ! command -v tmux &> /dev/null; then
    echo "❌ tmux is not installed. Install with: brew install tmux"
    echo "💡 Alternative: Use 'npm run dev:all' for similar functionality"
    exit 1
fi

# Kill existing session if it exists
tmux kill-session -t $SESSION_NAME 2>/dev/null || true

echo "🚀 Creating tmux development session: $SESSION_NAME"

# Run setup first
echo "🔧 Running development setup..."
./scripts/dev-setup.sh

# Create new session with first pane
tmux new-session -d -s $SESSION_NAME -n "dev"

# Set up the layout and panes
tmux send-keys -t $SESSION_NAME:dev "echo '🖥️  Next.js Development Server'" C-m
tmux send-keys -t $SESSION_NAME:dev "npm run dev 2>/dev/null || next dev --turbopack" C-m

# Split window into 4 panes
tmux split-window -t $SESSION_NAME:dev -h
tmux split-window -t $SESSION_NAME:dev -v
tmux select-pane -t $SESSION_NAME:dev.0
tmux split-window -t $SESSION_NAME:dev -v

# Configure each pane
# Pane 0 (top-left): Next.js app (already started)

# Pane 1 (bottom-left): Database info and logs
tmux send-keys -t $SESSION_NAME:dev.1 "echo '🐘 PostgreSQL Database'" C-m
tmux send-keys -t $SESSION_NAME:dev.1 "echo '   Connection: postgresql://neemee_user:local_dev_password@localhost:5432/neemee'" C-m
tmux send-keys -t $SESSION_NAME:dev.1 "echo '   Logs: docker logs -f neemee-local-postgres'" C-m
tmux send-keys -t $SESSION_NAME:dev.1 "echo '   CLI: docker exec -it neemee-local-postgres psql -U neemee_user -d neemee'" C-m
tmux send-keys -t $SESSION_NAME:dev.1 "echo ''" C-m

# Pane 2 (top-right): Prisma Studio
tmux send-keys -t $SESSION_NAME:dev.2 "echo '🔍 Starting Prisma Studio...'" C-m
tmux send-keys -t $SESSION_NAME:dev.2 "sleep 3 && dotenv -e .env.local -- prisma studio" C-m

# Pane 3 (bottom-right): Linting and type checking
tmux send-keys -t $SESSION_NAME:dev.3 "echo '🔧 Code Quality Tools'" C-m
tmux send-keys -t $SESSION_NAME:dev.3 "npm run dev:tools" C-m

# Select the main app pane
tmux select-pane -t $SESSION_NAME:dev.0

# Attach to session
echo "✅ Development session created!"
echo ""
echo "🎯 Services running:"
echo "   • Next.js App: http://localhost:3000 (top-left pane)"
echo "   • Prisma Studio: http://localhost:5555 (top-right pane)" 
echo "   • Database Info: PostgreSQL connection details (bottom-left pane)"
echo "   • Code Quality: Linting + TypeScript (bottom-right pane)"
echo ""
echo "⌨️  Tmux shortcuts:"
echo "   • Switch panes: Ctrl+b + arrow keys"
echo "   • Detach session: Ctrl+b + d"
echo "   • Reattach: tmux attach -t $SESSION_NAME"
echo "   • Kill session: tmux kill-session -t $SESSION_NAME"
echo ""

# Attach to the session
tmux attach-session -t $SESSION_NAME