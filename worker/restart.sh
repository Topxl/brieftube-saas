#!/bin/bash
#
# BriefTube Worker Restart Script
#

cd "$(dirname "$0")"

echo "🔄 Restarting BriefTube worker..."

# Stop
./stop.sh

# Wait a bit
sleep 2

# Start
./start.sh
