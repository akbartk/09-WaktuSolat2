#!/bin/bash
find_available_port() {
    local start_port=${1:-3000}
    local max_attempts=50
    
    for ((i=0; i<max_attempts; i++)); do
        local port=$((start_port + i))
        
        if ! netstat -tlnp 2>/dev/null | grep -q ":$port " && \
           ! ss -tlnp 2>/dev/null | grep -q ":$port "; then
            echo "$port"
            return 0
        fi
    done
    
    echo "No available port found starting from $start_port" >&2
    return 1
}

# Find available ports
DEV_PORT=$(find_available_port 3000)
DEV_WS_PORT=$(find_available_port 3001)
HTTP_PORT=$(find_available_port 8000)

echo "Available ports found:"
echo "DEV_PORT=$DEV_PORT"
echo "DEV_WS_PORT=$DEV_WS_PORT" 
echo "HTTP_PORT=$HTTP_PORT"

# Auto-update .env file
cat > ../.env << EOF
# Auto-generated port configuration
DEV_PORT=$DEV_PORT
DEV_WS_PORT=$DEV_WS_PORT
HTTP_PORT=$HTTP_PORT
HTTPS_PORT=443
PROD_PORT=3000

# Timezone
TZ=Asia/Jakarta

# Node environment
NODE_ENV=development

# Pengaturan untuk hot reload
CHOKIDAR_USEPOLLING=true
FAST_REFRESH=true

# Pengaturan untuk Vite
VITE_API_ALADHAN=https://api.aladhan.com/v1
VITE_API_MYQURAN=https://api.myquran.com/v2
VITE_API_IPGEOLOCATION=https://api.ipgeolocation.io/ipgeo
VITE_FALLBACK_LATITUDE=-6.2088
VITE_FALLBACK_LONGITUDE=106.8456
EOF

echo "✅ .env file updated with available ports"
