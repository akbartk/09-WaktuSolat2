#!/bin/bash
echo "🧪 Menjalankan test untuk Aplikasi Jadwal Sholat"
echo "================================================"

# Warna untuk output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Fungsi untuk memeriksa ketersediaan port
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
    else
        echo -e "${YELLOW}⚠️  Tidak dapat memeriksa port - netstat/ss tidak tersedia${NC}"
        return 0
    fi
}

# Test 1: Memeriksa struktur proyek
echo -e "\n${YELLOW}[Test 1]${NC} Memeriksa struktur proyek..."
REQUIRED_FILES=(
    "docker-compose.yml"
    "docker-compose.dev.yml"
    "Dockerfile.dev"
    "Dockerfile.prod"
    "nginx.conf"
    ".env"
    "src/App.jsx"
    "src/main.jsx"
    "src/index.css"
)

MISSING_FILES=0
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file ada"
    else
        echo -e "  ${RED}✗${NC} $file tidak ditemukan"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

if [ $MISSING_FILES -eq 0 ]; then
    echo -e "  ${GREEN}✓ Semua file yang diperlukan ada${NC}"
else
    echo -e "  ${RED}✗ $MISSING_FILES file tidak ditemukan${NC}"
fi

# Test 2: Memeriksa ketersediaan port
echo -e "\n${YELLOW}[Test 2]${NC} Memeriksa ketersediaan port..."
PORTS=(3000 3001 80 443)
BUSY_PORTS=0

for port in "${PORTS[@]}"; do
    if check_port $port; then
        echo -e "  ${GREEN}✓${NC} Port $port tersedia"
    else
        echo -e "  ${RED}✗${NC} Port $port sudah digunakan"
        BUSY_PORTS=$((BUSY_PORTS + 1))
    fi
done

if [ $BUSY_PORTS -eq 0 ]; then
    echo -e "  ${GREEN}✓ Semua port tersedia${NC}"
else
    echo -e "  ${YELLOW}⚠️ $BUSY_PORTS port sudah digunakan, akan menggunakan port alternatif${NC}"
fi

# Test 3: Memeriksa Docker
echo -e "\n${YELLOW}[Test 3]${NC} Memeriksa instalasi Docker..."
if command -v docker >/dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} Docker terinstal"
    DOCKER_VERSION=$(docker --version)
    echo -e "  ${GREEN}✓${NC} $DOCKER_VERSION"
else
    echo -e "  ${RED}✗${NC} Docker tidak terinstal"
fi

if command -v docker-compose >/dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} Docker Compose terinstal"
    COMPOSE_VERSION=$(docker-compose --version)
    echo -e "  ${GREEN}✓${NC} $COMPOSE_VERSION"
else
    echo -e "  ${RED}✗${NC} Docker Compose tidak terinstal"
fi

# Test 4: Memeriksa izin script
echo -e "\n${YELLOW}[Test 4]${NC} Memeriksa izin script..."
SCRIPTS=("start-dev.sh" "start-prod.sh" "check-ports.sh" "find-available-port.sh")
MISSING_PERMISSIONS=0

for script in "${SCRIPTS[@]}"; do
    if [ -x "scripts/$script" ]; then
        echo -e "  ${GREEN}✓${NC} scripts/$script memiliki izin eksekusi"
    else
        echo -e "  ${RED}✗${NC} scripts/$script tidak memiliki izin eksekusi"
        MISSING_PERMISSIONS=$((MISSING_PERMISSIONS + 1))
    fi
done

if [ $MISSING_PERMISSIONS -gt 0 ]; then
    echo -e "  ${YELLOW}⚠️ Memberikan izin eksekusi ke semua script...${NC}"
    chmod +x scripts/*.sh
    echo -e "  ${GREEN}✓${NC} Izin eksekusi diberikan"
fi

# Test 5: Memeriksa volume
echo -e "\n${YELLOW}[Test 5]${NC} Memeriksa struktur volume..."
VOLUMES=("volumes/node_modules" "volumes/build" "volumes/cache" "volumes/ssl")
MISSING_VOLUMES=0

for volume in "${VOLUMES[@]}"; do
    if [ -d "$volume" ]; then
        echo -e "  ${GREEN}✓${NC} $volume ada"
    else
        echo -e "  ${YELLOW}⚠️${NC} $volume tidak ditemukan, membuat direktori..."
        mkdir -p "$volume"
        echo -e "  ${GREEN}✓${NC} $volume dibuat"
    fi
done

# Ringkasan
echo -e "\n${YELLOW}[Ringkasan Test]${NC}"
if [ $MISSING_FILES -eq 0 ] && [ $MISSING_PERMISSIONS -eq 0 ]; then
    echo -e "${GREEN}✓ Semua test berhasil!${NC}"
    echo -e "${GREEN}✓ Aplikasi siap untuk dijalankan${NC}"
    echo -e "\nUntuk menjalankan aplikasi dalam mode development:"
    echo -e "  ${YELLOW}./scripts/start-dev.sh${NC}"
    echo -e "\nUntuk menjalankan aplikasi dalam mode production:"
    echo -e "  ${YELLOW}./scripts/start-prod.sh${NC}"
else
    echo -e "${RED}✗ Beberapa test gagal, silakan perbaiki masalah di atas${NC}"
fi

echo -e "\n${YELLOW}[Checklist Manual Testing]${NC}"
echo "Silakan lakukan testing manual berikut:"
echo "- [ ] Test dalam development container (docker-compose.dev.yml)"
echo "- [ ] Test dalam production container (docker-compose.yml)"
echo "- [ ] Test dengan izin GPS diberikan"
echo "- [ ] Test dengan izin GPS ditolak"
echo "- [ ] Test dengan koneksi jaringan terputus"
echo "- [ ] Test di berbagai timezone"
echo "- [ ] Test transisi waktu sholat"
echo "- [ ] Test desain responsif di mobile (320px - 768px)"
echo "- [ ] Test desain responsif di tablet (768px - 1024px)"
echo "- [ ] Test desain responsif di desktop (1024px+)"
echo "- [ ] Test dark mode dan light mode"
echo "- [ ] Test toggle theme functionality"
echo "- [ ] Test persistence theme setelah refresh"
echo "- [ ] Test accessibility dengan screen reader"
echo "- [ ] Test touch interactions di mobile"
echo "- [ ] Test skenario fallback API"
echo "- [ ] Test loading states dengan Skeleton components"
echo "- [ ] Test hot reload dalam development container"
echo "- [ ] Test volume persistence setelah container restart"
echo "- [ ] Test build performance dalam container"
echo "- [ ] Test nginx serving di production"
