#!/bin/bash
echo "🚀 Starting Jadwal Sholat Development Environment..."

# Check if ports are available
./scripts/check-ports.sh

# If default ports are taken, find alternatives
if netstat -tlnp 2>/dev/null | grep -q ":3000 "; then
    echo "🔄 Port 3000 is busy, finding alternative..."
    ./scripts/find-available-port.sh
fi

# Load environment variables
set -a
source .env 2>/dev/null || echo "No .env file found, using defaults"
set +a

echo "📡 Starting containers with ports:"
echo "   App: ${DEV_PORT:-3000}"
echo "   WebSocket: ${DEV_WS_PORT:-3001}"

# Start development environment
docker-compose -f docker-compose.dev.yml up --build

echo "🎉 Development server started!"
echo "📱 Access app at: http://localhost:${DEV_PORT:-3000}"
