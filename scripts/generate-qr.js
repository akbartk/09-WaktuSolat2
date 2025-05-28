// Script untuk menghasilkan QR code untuk akses mudah
import qrcodeTerminal from 'qrcode-terminal';
import os from 'os';

// Mendapatkan alamat IP jaringan lokal
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Cari alamat IPv4 yang bukan localhost dan bukan internal Docker
      if (iface.family === 'IPv4' && !iface.internal && !name.includes('docker') && !name.includes('veth')) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1'; // Fallback ke localhost jika tidak ditemukan
};

// Dapatkan port dari argumen atau gunakan default
const port = process.argv[2] || '3003';
const localIP = getLocalIP();
const url = `http://${localIP}:${port}`;

console.log(`\n🌐 Aplikasi Jadwal Sholat dapat diakses di:\n${url}\n`);
console.log('📱 Scan QR code berikut untuk mengakses dari perangkat mobile:');
qrcodeTerminal.generate(url, { small: true });
