#!/bin/bash
echo "🚀 Memulai deployment Jadwal Sholat ke produksi (akbartk.info)"
echo "============================================================="

# Warna untuk output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Periksa apakah port 80 dan 443 tersedia
echo -e "${YELLOW}[1/5]${NC} Memeriksa ketersediaan port..."

check_port() {
    local port=$1
    if command -v netstat >/dev/null 2>&1; then
        if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
            return 1
        else
            return 0
        fi
    elif command -v ss >/dev/null 2>&1; then
        if ss -tlnp | grep -q ":$port "; then
            return 1
        else
            return 0
        fi
    fi
    return 0
}

if ! check_port 80; then
    echo -e "${RED}[PERINGATAN]${NC} Port 80 sudah digunakan. Pastikan tidak ada layanan lain yang menggunakan port ini."
    echo -e "Anda dapat mengubah port di file .env (HTTP_PORT=8080)"
fi

if ! check_port 443; then
    echo -e "${RED}[PERINGATAN]${NC} Port 443 sudah digunakan. Pastikan tidak ada layanan lain yang menggunakan port ini."
    echo -e "Anda dapat mengubah port di file .env (HTTPS_PORT=8443)"
fi

# Load environment variables
echo -e "${YELLOW}[2/5]${NC} Memuat variabel lingkungan..."
set -a
source .env 2>/dev/null || echo -e "${YELLOW}[INFO]${NC} File .env tidak ditemukan, menggunakan nilai default dari .env.example"
set +a

# Build aplikasi
echo -e "${YELLOW}[3/5]${NC} Membangun aplikasi untuk produksi..."
npm run build

# Periksa sertifikat SSL
echo -e "${YELLOW}[4/5]${NC} Memeriksa sertifikat SSL..."
if [ ! -f "./volumes/ssl/akbartk.info.crt" ] || [ ! -f "./volumes/ssl/akbartk.info.key" ]; then
    echo -e "${YELLOW}[INFO]${NC} Sertifikat SSL tidak ditemukan, membuat sertifikat self-signed untuk pengujian..."
    mkdir -p ./volumes/ssl
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ./volumes/ssl/akbartk.info.key \
        -out ./volumes/ssl/akbartk.info.crt \
        -subj "/C=ID/ST=Jakarta/L=Jakarta/O=AkbarTK/OU=IT/CN=akbartk.info"
    echo -e "${GREEN}[SUKSES]${NC} Sertifikat self-signed berhasil dibuat"
    echo -e "${YELLOW}[CATATAN]${NC} Untuk produksi, gunakan sertifikat dari otoritas sertifikat tepercaya seperti Let's Encrypt"
else
    echo -e "${GREEN}[SUKSES]${NC} Sertifikat SSL ditemukan"
fi

# Jalankan container
echo -e "${YELLOW}[5/5]${NC} Menjalankan container produksi..."
echo -e "Domain: ${DOMAIN:-akbartk.info}"
echo -e "HTTP Port: ${HTTP_PORT:-80}"
echo -e "HTTPS Port: ${HTTPS_PORT:-443}"

docker-compose -f docker-compose.yml down
docker-compose -f docker-compose.yml up -d --build

echo -e "\n${GREEN}[SELESAI]${NC} Aplikasi Jadwal Sholat berhasil di-deploy ke produksi!"
echo -e "Aplikasi dapat diakses melalui: ${GREEN}https://${DOMAIN:-akbartk.info}${NC}"
