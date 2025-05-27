# Waktu Solat AkbarTK - Aplikasi Jadwal Sholat

Aplikasi jadwal sholat yang menyediakan waktu sholat Islam yang akurat berdasarkan lokasi real-time pengguna. Aplikasi ini dirancang untuk 100% dinamis tanpa nilai hardcode untuk fleksibilitas dan akurasi maksimal.

## Akses Aplikasi Online

Aplikasi ini dapat diakses secara online melalui:

**🌐 [https://akbartk.info](https://akbartk.info)**

Aplikasi ini mendukung akses melalui HTTPS (port 443) dan HTTP (port 80, akan diarahkan ke HTTPS).

## Fitur Utama

- **Deteksi Lokasi Otomatis** dengan 3 tingkat fallback (GPS → IP → Default)
- **Jadwal Sholat Dinamis** berdasarkan koordinat lokasi
- **Konversi Tanggal Hijriah** secara real-time
- **Tema Gelap/Terang** dengan persistensi
- **Tampilan Responsif** untuk semua ukuran layar
- **Loading States** dengan komponen Skeleton
- **Penanganan Error** dengan Toast notifications

## Teknologi yang Digunakan

- **React** dengan hooks (useState, useEffect)
- **Tailwind CSS** untuk styling
- **shadcn/ui** untuk komponen UI yang konsisten dan accessible
- **Vite** untuk bundling
- **Docker** dan **Docker Compose** untuk containerized development dan deployment

## Cara Menjalankan

### Menggunakan Docker (Direkomendasikan)

1. Pastikan Docker dan Docker Compose sudah terinstal di sistem Anda
2. Clone repositori ini
3. Jalankan aplikasi dalam mode development:

```bash
./scripts/start-dev.sh
```

4. Atau jalankan dalam mode production:

```bash
./scripts/start-prod.sh
```

### Tanpa Docker

1. Pastikan Node.js versi 18 atau lebih baru sudah terinstal
2. Clone repositori ini
3. Install dependencies:

```bash
npm install
```

4. Jalankan dalam mode development:

```bash
npm run dev
```

## Cara Deploy ke GitHub Pages

1. Fork repositori ini ke akun GitHub Anda
2. Clone repositori yang sudah di-fork:

```bash
git clone https://github.com/username/09-WaktuSolat2.git
cd 09-WaktuSolat2
```

3. Install dependencies:

```bash
npm install
```

4. Deploy ke GitHub Pages:

```bash
npm run deploy
```

Atau, Anda bisa menggunakan GitHub Actions yang sudah dikonfigurasi. Setiap kali Anda melakukan push ke branch `main`, aplikasi akan otomatis di-deploy ke GitHub Pages.

5. Atau build untuk production:

```bash
npm run build
```

## API yang Digunakan

- **AlAdhan API** untuk jadwal sholat dan konversi tanggal Hijriah
- **IP Geolocation API** sebagai fallback untuk deteksi lokasi

## Struktur Proyek

```
jadwal-sholat/
├── docker-compose.yml        # Konfigurasi Docker Compose untuk production
├── docker-compose.dev.yml    # Konfigurasi Docker Compose untuk development
├── Dockerfile.dev            # Dockerfile untuk development
├── Dockerfile.prod           # Dockerfile untuk production
├── nginx.conf                # Konfigurasi Nginx untuk production
├── volumes/                  # Volume Docker untuk persistensi data
├── scripts/                  # Script untuk menjalankan aplikasi
├── src/                      # Source code React
│   ├── components/           # Komponen React
│   ├── hooks/                # Custom hooks
│   ├── utils/                # Fungsi utilitas
│   └── App.jsx               # Komponen utama aplikasi
└── public/                   # Aset statis
```

## Checklist Testing

- [ ] Test dalam development container (docker-compose.dev.yml)
- [ ] Test dalam production container (docker-compose.yml)
- [ ] Test dengan izin GPS diberikan
- [ ] Test dengan izin GPS ditolak
- [ ] Test dengan koneksi jaringan terputus
- [ ] Test di berbagai timezone
- [ ] Test transisi waktu sholat
- [ ] Test desain responsif di berbagai ukuran layar
- [ ] Test dark mode dan light mode
- [ ] Test accessibility
- [ ] Test skenario fallback API

## Kontribusi

Kontribusi selalu diterima dengan senang hati. Silakan buat pull request atau issue jika Anda ingin berkontribusi.

## Lisensi

MIT
