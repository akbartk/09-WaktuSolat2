#!/bin/bash
echo "🔍 Checking port availability..."

check_port() {
    local port=$1
    local service=$2
    
    if command -v netstat >/dev/null 2>&1; then
        if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
            echo "❌ Port $port ($service) is already in use"
            return 1
        else
            echo "✅ Port $port ($service) is available"
            return 0
        fi
    elif command -v ss >/dev/null 2>&1; then
        if ss -tlnp | grep -q ":$port "; then
            echo "❌ Port $port ($service) is already in use" 
            return 1
        else
            echo "✅ Port $port ($service) is available"
            return 0
        fi
    else
        echo "⚠️  Cannot check port $port - netstat/ss not available"
        return 0
    fi
}

# Load environment variables if .env exists
if [ -f ../.env ]; then
    source ../.env
fi

# Check default ports
check_port ${DEV_PORT:-3000} "Development App"
check_port ${DEV_WS_PORT:-3001} "Hot Reload WebSocket" 
check_port ${HTTP_PORT:-80} "HTTP Nginx"
check_port ${HTTPS_PORT:-443} "HTTPS Nginx"

echo ""
echo "💡 If ports are in use, update your .env file:"
echo "DEV_PORT=4000"
echo "DEV_WS_PORT=4001" 
echo "HTTP_PORT=8080"
echo "HTTPS_PORT=8443"
