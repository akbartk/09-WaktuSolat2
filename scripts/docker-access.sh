#!/bin/bash
# Script untuk memudahkan akses aplikasi Jadwal Sholat dari perangkat lain
# dalam jaringan yang sama saat berjalan dalam kontainer Docker

# Warna untuk output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Informasi Akses Aplikasi Jadwal Sholat ===${NC}\n"

# Cek apakah docker dan docker-compose terinstall
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker tidak terinstall.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! command -v docker compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose tidak terinstall.${NC}"
    exit 1
fi

# Cek apakah container berjalan
if docker ps | grep -q "jadwal-sholat"; then
    echo -e "${GREEN}✓ Container Jadwal Sholat terdeteksi sedang berjalan${NC}"
else
    echo -e "${YELLOW}⚠ Container Jadwal Sholat tidak terdeteksi. Pastikan container sudah berjalan.${NC}"
    echo -e "  Jalankan: ${BLUE}docker-compose -f docker-compose.dev.yml up -d${NC} untuk development"
    echo -e "  atau: ${BLUE}docker-compose up -d${NC} untuk production"
    exit 1
fi

# Dapatkan alamat IP host
HOST_IP=$(hostname -I | awk '{print $1}')
if [ -z "$HOST_IP" ]; then
    echo -e "${RED}Error: Tidak dapat mendeteksi alamat IP host.${NC}"
    HOST_IP="<alamat-ip-host>"
fi

# Dapatkan port yang digunakan
DEV_PORT=$(grep -oP '"\$\{DEV_PORT:-\K[0-9]+' docker-compose.dev.yml || echo "3000")
PROD_PORT=$(grep -oP '"\$\{PROD_PORT:-\K[0-9]+' docker-compose.yml || echo "3005")
HTTP_PORT=$(grep -oP '"\$\{HTTP_PORT:-\K[0-9]+' docker-compose.yml || echo "3030")

# Cek environment file untuk port kustom
if [ -f .env ]; then
    source .env
    DEV_PORT=${DEV_PORT:-3000}
    PROD_PORT=${PROD_PORT:-3005}
    HTTP_PORT=${HTTP_PORT:-3030}
fi

# Cek container mana yang berjalan
if docker ps | grep -q "jadwal-sholat-dev"; then
    MODE="development"
    PORT=$DEV_PORT
    echo -e "${GREEN}Mode: Development${NC}"
    echo -e "${GREEN}Port: $PORT${NC}"
elif docker ps | grep -q "jadwal-sholat-app"; then
    MODE="production"
    PORT=$PROD_PORT
    NGINX_PORT=$HTTP_PORT
    echo -e "${GREEN}Mode: Production${NC}"
    echo -e "${GREEN}Port Aplikasi: $PORT${NC}"
    echo -e "${GREEN}Port Nginx: $NGINX_PORT${NC}"
else
    echo -e "${YELLOW}⚠ Tidak dapat mendeteksi mode container yang berjalan.${NC}"
    MODE="unknown"
    PORT="3000 atau 3005"
fi

echo -e "\n${BLUE}=== URL Akses ===${NC}"

if [ "$MODE" = "development" ]; then
    echo -e "${GREEN}URL Development:${NC}"
    echo -e "  ${BLUE}http://$HOST_IP:$PORT${NC}"
elif [ "$MODE" = "production" ]; then
    echo -e "${GREEN}URL Production (Aplikasi):${NC}"
    echo -e "  ${BLUE}http://$HOST_IP:$PORT${NC}"
    echo -e "${GREEN}URL Production (Nginx):${NC}"
    echo -e "  ${BLUE}http://$HOST_IP:$NGINX_PORT${NC}"
else
    echo -e "${YELLOW}URL (coba salah satu):${NC}"
    echo -e "  ${BLUE}http://$HOST_IP:3000${NC}"
    echo -e "  ${BLUE}http://$HOST_IP:3005${NC}"
    echo -e "  ${BLUE}http://$HOST_IP:3030${NC}"
fi

echo -e "\n${BLUE}=== Troubleshooting ===${NC}"
echo -e "1. Pastikan perangkat berada dalam jaringan yang sama"
echo -e "2. Pastikan port yang digunakan tidak diblokir oleh firewall"
echo -e "3. Jika menggunakan Docker Desktop, pastikan port forwarding diaktifkan"
echo -e "4. Coba akses melalui alamat IP Docker jika host IP tidak berfungsi:"
DOCKER_IP=$(docker network inspect bridge -f '{{range .IPAM.Config}}{{.Gateway}}{{end}}')
if [ -n "$DOCKER_IP" ]; then
    echo -e "   ${BLUE}http://$DOCKER_IP:$PORT${NC}"
fi

echo -e "\n${BLUE}=== Perintah Docker ===${NC}"
echo -e "Start Development: ${YELLOW}docker-compose -f docker-compose.dev.yml up -d${NC}"
echo -e "Start Production:  ${YELLOW}docker-compose up -d${NC}"
echo -e "Lihat Logs:        ${YELLOW}docker-compose logs -f${NC}"
echo -e "Stop Container:    ${YELLOW}docker-compose down${NC}"

# Cek apakah qrencode terinstall untuk membuat QR code
if command -v qrencode &> /dev/null; then
    echo -e "\n${BLUE}=== QR Code untuk Akses Mobile ===${NC}"
    if [ "$MODE" = "development" ]; then
        echo -e "QR Code untuk URL: ${BLUE}http://$HOST_IP:$PORT${NC}"
        qrencode -t ANSI "http://$HOST_IP:$PORT"
    elif [ "$MODE" = "production" ]; then
        echo -e "QR Code untuk URL: ${BLUE}http://$HOST_IP:$NGINX_PORT${NC}"
        qrencode -t ANSI "http://$HOST_IP:$NGINX_PORT"
    fi
else
    echo -e "\n${YELLOW}⚠ qrencode tidak terinstall. Untuk membuat QR code, install dengan:${NC}"
    echo -e "  ${BLUE}sudo apt-get install qrencode${NC} (Ubuntu/Debian)"
    echo -e "  ${BLUE}brew install qrencode${NC} (macOS)"
fi
