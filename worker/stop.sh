#!/bin/bash
#
# BriefTube Worker Stop Script
#

echo "🛑 Stopping BriefTube worker..."

PID=$(pgrep -f "python.*main.py")

if [ -z "$PID" ]; then
    echo "ℹ️  Worker is not running"
    exit 0
fi

echo "Found worker with PID: $PID"
kill $PID

sleep 2

if ps -p $PID > /dev/null 2>&1; then
    echo "⚠️  Worker didn't stop gracefully, forcing..."
    kill -9 $PID
fi

echo "✅ Worker stopped"
