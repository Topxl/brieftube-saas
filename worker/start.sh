#!/bin/bash
#
# BriefTube Worker Startup Script
#

cd "$(dirname "$0")"

echo "🔍 Checking worker status..."

# Check if worker is already running
if pgrep -f "python.*main.py" > /dev/null; then
    echo "⚠️  Worker is already running!"
    echo ""
    echo "Options:"
    echo "  1. Stop it first:   ./stop.sh"
    echo "  2. Restart it:      ./restart.sh"
    echo "  3. View logs:       tail -f worker.log"
    exit 1
fi

echo "📦 Checking dependencies..."
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Run: python3 -m venv venv && venv/bin/pip install -r requirements.txt"
    exit 1
fi

echo "🚀 Starting BriefTube worker..."
nohup venv/bin/python3 main.py > worker.log 2>&1 &
PID=$!

sleep 2

if ps -p $PID > /dev/null; then
    echo "✅ Worker started successfully!"
    echo "   PID: $PID"
    echo ""
    echo "📊 Monitor the worker:"
    echo "   tail -f worker.log           # View logs"
    echo "   /monitor_status             # Telegram command"
    echo ""
    echo "⚠️  Don't forget to set ADMIN_TELEGRAM_CHAT_ID in .env"
else
    echo "❌ Worker failed to start. Check worker.log for errors."
    exit 1
fi
