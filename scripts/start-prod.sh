#!/bin/bash
echo "🏭 Starting Jadwal Sholat Production Environment..."

# Check critical ports
if netstat -tlnp 2>/dev/null | grep -q ":80 "; then
    echo "⚠️  Port 80 is busy, using alternative port 8080"
    export HTTP_PORT=8080
fi

# Load environment variables
set -a
source .env 2>/dev/null || echo "No .env file found, using defaults"
set +a

echo "🌐 Starting production with ports:"
echo "   HTTP: ${HTTP_PORT:-80}"
echo "   HTTPS: ${HTTPS_PORT:-443}"

# Start production environment
docker-compose -f docker-compose.yml up -d --build

echo "✅ Production server started!"
echo "🌍 Access app at: http://localhost:${HTTP_PORT:-80}"
