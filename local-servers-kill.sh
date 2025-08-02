#!/bin/bash

# Kill Local Servers Script
# Kills all locally running development servers for Neemee frontend and backend

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
echo "🎉 All development servers have been terminated!"
echo ""

# Verify no servers are still running
echo "🔍 Verification - checking for remaining development processes..."
REMAINING=$(ps aux | grep -E "(next|uvicorn|node.*next|npm.*dev|python.*main)" | grep -v grep | grep -v kill-local-servers)

if [ -z "$REMAINING" ]; then
    echo "✅ All clear - no development servers are running"
else
    echo "⚠️  Some processes may still be running:"
    echo "$REMAINING"
fi