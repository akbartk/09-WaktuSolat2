#!/bin/bash
echo "🚀 Memulai deployment Jadwal Sholat ke produksi (akbartk.info)"
echo "============================================================="

# Warna untuk output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Periksa apakah port 3030 tersedia
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

if ! check_port 3030; then
    echo -e "${RED}[PERINGATAN]${NC} Port 3030 sudah digunakan. Pastikan tidak ada layanan lain yang menggunakan port ini."
    echo -e "Anda dapat mengubah port di file .env (HTTP_PORT=3031)"
fi

# Load environment variables
echo -e "${YELLOW}[2/5]${NC} Memuat variabel lingkungan..."
set -a
source .env 2>/dev/null || echo -e "${YELLOW}[INFO]${NC} File .env tidak ditemukan, menggunakan nilai default dari .env.example"
set +a

# Build aplikasi
echo -e "${YELLOW}[3/5]${NC} Membangun aplikasi untuk produksi..."
npm run build

# Salin file build ke direktori volumes/dist
echo -e "${YELLOW}[3.5/5]${NC} Menyalin file build ke direktori volumes/dist..."
mkdir -p ./volumes/dist
cp -r ./dist/* ./volumes/dist/
echo -e "${GREEN}[SUKSES]${NC} File build berhasil disalin ke direktori volumes/dist"

# Memastikan direktori volumes ada
echo -e "${YELLOW}[4/5]${NC} Memeriksa direktori volumes..."
mkdir -p ./volumes/build
mkdir -p ./volumes/cache
echo -e "${GREEN}[SUKSES]${NC} Direktori volumes siap digunakan"

# Jalankan container
echo -e "${YELLOW}[5/5]${NC} Menjalankan container produksi..."
echo -e "Domain: ${DOMAIN:-akbartk.info}"
echo -e "HTTP Port: ${HTTP_PORT:-3030}"
echo -e "API Port: ${PROD_PORT:-3005}"

docker compose -f docker-compose.yml down
docker compose -f docker-compose.yml up -d --build

echo -e "\n${GREEN}[SELESAI]${NC} Aplikasi Jadwal Sholat berhasil di-deploy ke produksi!"
echo -e "Aplikasi dapat diakses melalui: ${GREEN}http://${DOMAIN:-akbartk.info}:${HTTP_PORT:-3030}${NC}"
echo -e "API server berjalan di: ${GREEN}http://${DOMAIN:-akbartk.info}:${PROD_PORT:-3005}${NC}"
