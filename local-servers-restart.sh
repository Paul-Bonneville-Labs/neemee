#!/bin/bash

# Restart Local Servers Script
# Kills all locally running development servers and then restarts them

echo "🔄 Restarting Neemee development servers..."
echo ""

# Kill existing servers first
echo "🛑 Stopping existing servers..."
echo "🔍 Searching for running development servers..."

# Kill Next.js development servers
echo "📱 Killing Next.js frontend servers..."
pkill -f "next dev" 2>/dev/null && echo "   ✅ Killed Next.js processes" || echo "   ℹ️  No Next.js processes found"

# Kill Node.js processes that might be running Next.js
pkill -f "node.*next" 2>/dev/null && echo "   ✅ Killed Node.js Next.js processes" || echo "   ℹ️  No Node.js Next.js processes found"

# Kill npm dev processes
pkill -f "npm run dev" 2>/dev/null && echo "   ✅ Killed npm dev processes" || echo "   ℹ️  No npm dev processes found"

# Kill FastAPI/uvicorn backend servers
echo "🚀 Killing FastAPI backend servers..."
pkill -f "uvicorn" 2>/dev/null && echo "   ✅ Killed uvicorn processes" || echo "   ℹ️  No uvicorn processes found"

# Kill Python processes running main.py
pkill -f "python.*main" 2>/dev/null && echo "   ✅ Killed Python main processes" || echo "   ℹ️  No Python main processes found"

# Kill any processes using common development ports
echo "🔌 Checking for processes on development ports..."
for port in 3000 3001 8000; do
    if lsof -ti:$port >/dev/null 2>&1; then
        echo "   🔥 Killing process on port $port..."
        lsof -ti:$port | xargs kill -9 2>/dev/null
        echo "   ✅ Port $port cleared"
    else
        echo "   ✅ Port $port is free"
    fi
done

echo ""
echo "⏳ Waiting 2 seconds for processes to fully terminate..."
sleep 2

echo ""
echo "🚀 Starting development servers..."

# Check if we're in the correct directory
if [ ! -f "package.json" ] && [ ! -d "frontend" ] && [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the neemee project root directory"
    exit 1
fi

# Start backend server
echo "🐍 Starting FastAPI backend server..."
if [ -d "backend" ]; then
    cd backend
    if [ ! -d ".venv" ]; then
        echo "❌ Error: Python virtual environment not found in backend/"
        echo "   Please run: cd backend && python3.13 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"
        exit 1
    fi
    
    # Start backend in background
    echo "   📡 Starting uvicorn server on port 8000..."
    source .venv/bin/activate
    nohup uvicorn src.main:app --reload --host 0.0.0.0 --port 8000 --log-level info > ../backend-server.log 2>&1 &
    BACKEND_PID=$!
    echo "   ✅ Backend server started (PID: $BACKEND_PID)"
    cd ..
else
    echo "❌ Error: backend directory not found"
    exit 1
fi

# Start frontend server
echo "📱 Starting Next.js frontend server..."
if [ -d "frontend" ]; then
    cd frontend
    if [ ! -d "node_modules" ]; then
        echo "❌ Error: node_modules not found in frontend/"
        echo "   Please run: cd frontend && npm install"
        exit 1
    fi
    
    # Start frontend in background
    echo "   🌐 Starting Next.js server on port 3000..."
    nohup npm run dev > ../frontend-server.log 2>&1 &
    FRONTEND_PID=$!
    echo "   ✅ Frontend server started (PID: $FRONTEND_PID)"
    cd ..
else
    echo "❌ Error: frontend directory not found"
    exit 1
fi

echo ""
echo "⏳ Waiting 3 seconds for servers to initialize..."
sleep 3

echo ""
echo "🔍 Verifying servers are running..."

# Check backend
if curl -s http://localhost:8000/health >/dev/null 2>&1; then
    echo "✅ Backend server is responding on http://localhost:8000"
else
    echo "⚠️  Backend server may still be starting up"
fi

# Check frontend
if curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Frontend server is responding on http://localhost:3000"
else
    echo "⚠️  Frontend server may still be starting up"
fi

echo ""
echo "🎉 Development servers restarted successfully!"
echo ""
echo "📋 Server Information:"
echo "   🐍 Backend:  http://localhost:8000 (logs: backend-server.log)"
echo "   📱 Frontend: http://localhost:3000 (logs: frontend-server.log)"
echo ""
echo "📝 To view logs:"
echo "   Backend:  tail -f backend-server.log"
echo "   Frontend: tail -f frontend-server.log"
echo ""
echo "🛑 To stop servers: ./kill-local-servers.sh"