import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Switch } from './components/ui/switch'
import { Skeleton } from './components/ui/skeleton'
import { useTheme } from './components/theme-provider'
import { useToast } from './components/ui/use-toast'
import { Clock, MapPin, Moon, Sun, RefreshCw } from 'lucide-react'
import { forceStylesheetReload } from './forceRefresh'
import { corsProxy, fetchWithFallback, getLocationFromIP } from './cors-proxy' // Import fungsi proxy CORS, fetchWithFallback, dan getLocationFromIP
import PrayerIcon from './components/prayer/PrayerIcon' // Production Prayer Icon Component
import { getCalculationMethod, getContinentFromCoordinates, formatMethodDisplay } from './utils/globalPrayerMethods' // Global prayer methods
import { t, getCurrentLanguage, isRTL, formatLocalizedDate, formatLocalizedTime } from './utils/i18n' // Internationalization
import './preload-icons.css' // Menambahkan CSS untuk preload ikon

function App() {
  // State untuk data aplikasi
  const [waktuSekarang, setWaktuSekarang] = useState(new Date())
  const [lokasi, setLokasi] = useState(null)
  const [namaLokasi, setNamaLokasi] = useState('') // State untuk menyimpan nama lokasi
  const [jadwalSholat, setJadwalSholat] = useState(null)
  const [tanggalHijriah, setTanggalHijriah] = useState('')
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true) // State untuk loading awal
  const [iconsLoaded, setIconsLoaded] = useState(false) // State untuk memastikan ikon sudah dimuat
  const [sumberLokasi, setSumberLokasi] = useState('loading')
  const [sholatBerikutnya, setSholatBerikutnya] = useState(null)
  const [countdown, setCountdown] = useState('')
  const [zonaWaktu, setZonaWaktu] = useState('') // State untuk menyimpan zona waktu
  const [prayerMethod, setPrayerMethod] = useState(null) // State untuk calculation method
  const [countryInfo, setCountryInfo] = useState(null) // State untuk country information
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage()) // State untuk bahasa
  const [showLocationPicker, setShowLocationPicker] = useState(false) // State untuk manual location picker
  
  // Hooks untuk tema dan toast
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  // Function untuk translate prayer names
  const getPrayerName = (key) => {
    const prayerMap = {
      'subuh': 'fajr',
      'dzuhur': 'dhuhr', 
      'ashar': 'asr',
      'maghrib': 'maghrib',
      'isya': 'isha'
    }
    return t(prayerMap[key] || key, currentLang)
  }

  // Efek untuk update waktu setiap detik
  useEffect(() => {
    const interval = setInterval(() => {
      // Update waktu dengan mempertimbangkan zona waktu lokasi jika tersedia
      setWaktuSekarang(new Date())
      if (jadwalSholat) {
        hitungSholatBerikutnya()
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [jadwalSholat])
  
  // Efek untuk memaksa refresh stylesheet CSS dan preload ikon
  useEffect(() => {
    // Preload ikon-ikon SVG
    const iconImages = [
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 12a11 11 0 1 1-22 0 11 11 0 0 1 22 0Z"/><path d="m8 12 3 3 5-5"/></svg>'
    ];
    
    const preloadIcons = async () => {
      const promises = iconImages.map(src => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Resolve even on error to avoid blocking
          img.src = src;
        });
      });
      
      await Promise.all(promises);
      setIconsLoaded(true);
    };
    
    preloadIcons();
    
    // Tunggu sebentar untuk memastikan DOM sudah siap
    setTimeout(() => {
      forceStylesheetReload();
      console.log('Stylesheet di-refresh saat aplikasi dimuat');
      // Setelah 1.5 detik, anggap loading awal selesai
      setTimeout(() => {
        setInitialLoading(false);
      }, 1500);
    }, 500);
  }, [])

  // Efek untuk mendapatkan jadwal sholat saat lokasi berubah
  useEffect(() => {
    if (lokasi) {
      ambilJadwalSholat(lokasi)
      ambilTanggalHijriah()
    }
  }, [lokasi])
  
  // Efek untuk mendapatkan lokasi saat komponen dimuat (hanya sekali)
  useEffect(() => {
    // Gunakan flag untuk menghindari notifikasi berulang
    const showToast = sessionStorage.getItem('locationToastShown') !== 'true';
    dapatkanLokasi(showToast);
    if (showToast) {
      sessionStorage.setItem('locationToastShown', 'true');
    }
  }, [])

  // Fungsi untuk mendapatkan lokasi pengguna - GPS sebagai prioritas utama
  const dapatkanLokasi = async (showToast = true) => {
    setLoading(true)
    setSumberLokasi('loading')
    
    console.log('🔍 Memulai deteksi lokasi dengan GPS sebagai prioritas...')
    
    // Tampilkan toast untuk memberi tahu pengguna tentang permintaan lokasi GPS
    if (showToast) {
      toast({
        title: t('detectingLocation', currentLang),
        description: t('locationPermission', currentLang),
      })
    }
    
    // Strategy 1: PRIORITAS UTAMA - GPS/Geolocation API (meminta permission)
    // Cek apakah browser dan environment mendukung geolocation
    if (navigator.geolocation) {
      try {
        console.log('🌍 Meminta izin GPS geolocation...')
        console.log('📱 User Agent:', navigator.userAgent);
        console.log('🔒 Protocol:', window.location.protocol);
        console.log('🌐 Host:', window.location.host);
        
        // Cek apakah ini HTTPS atau localhost (geolocation requirements)
        const isSecureContext = window.isSecureContext || 
          window.location.protocol === 'https:' || 
          window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1';
        
        console.log('🔐 Is Secure Context:', isSecureContext);
        
        if (!isSecureContext) {
          console.warn('⚠️ Geolocation mungkin tidak bekerja di HTTP pada mobile browser');
          
          // Untuk mobile di HTTP, langsung skip ke IP geolocation
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          if (isMobile) {
            console.log('📱 Mobile browser di HTTP terdeteksi, skip ke IP geolocation');
            throw new Error('Mobile HTTP context - skip to IP geolocation');
          }
        }
        
        // Buat Promise untuk menangani getCurrentPosition dengan timeout yang wajar
        const getPositionPromise = new Promise((resolve, reject) => {
          console.log('🎯 Memulai getCurrentPosition request...');
          
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('✅ GPS berhasil:', position.coords);
              console.log('📍 Lat:', position.coords.latitude, 'Lng:', position.coords.longitude);
              console.log('🎯 Accuracy:', position.coords.accuracy, 'meters');
              resolve(position);
            },
            (error) => {
              console.error('❌ GPS error details:');
              console.error('- Error code:', error.code);
              console.error('- Error message:', error.message);
              console.error('- Error PERMISSION_DENIED:', error.PERMISSION_DENIED);
              console.error('- Error POSITION_UNAVAILABLE:', error.POSITION_UNAVAILABLE);  
              console.error('- Error TIMEOUT:', error.TIMEOUT);
              reject(error);
            },
            { 
              enableHighAccuracy: true,  // Akurasi tinggi untuk hasil terbaik
              timeout: 15000,           // Timeout 15 detik seperti versi sebelumnya
              maximumAge: 300000        // Cache 5 menit untuk mengurangi permintaan berulang
            }
          );
        });
        
        const position = await getPositionPromise;
        const { latitude, longitude } = position.coords;
        
        setLokasi({ latitude, longitude });
        setSumberLokasi('gps');
        
        // Dapatkan nama lokasi dan zona waktu berdasarkan koordinat
        dapatkanNamaLokasi(latitude, longitude);
        
        if (showToast) {
          toast({
            title: t('locationFound', currentLang),
            description: t('usingGPS', currentLang),
          });
        }
        
        setLoading(false);
        return; // Sukses, keluar dari fungsi
        
      } catch (gpsError) {
        console.warn('⚠️ GPS geolocation gagal:', gpsError);
        
        // Tampilkan pesan yang informatif berdasarkan error GPS
        if (showToast && gpsError.code) {
          let errorMessage = t('locationPermission', currentLang);
          
          if (gpsError.code === 1) { // PERMISSION_DENIED
            errorMessage = 'Akses lokasi ditolak. Mencoba metode alternatif...';
          } else if (gpsError.code === 2) { // POSITION_UNAVAILABLE
            errorMessage = 'GPS tidak tersedia. Mencoba metode alternatif...';
          } else if (gpsError.code === 3) { // TIMEOUT
            errorMessage = 'Timeout GPS. Mencoba metode alternatif...';
          }
          
          // Untuk mobile di HTTP, tampilkan pesan khusus HTTPS
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          const isHttp = window.location.protocol === 'http:' && window.location.hostname !== 'localhost';
          
          if (isMobile && isHttp) {
            errorMessage = 'Mobile browser memerlukan HTTPS untuk GPS. Menggunakan IP location...';
          }
          
          toast({
            title: t('detectingLocation', currentLang),
            description: errorMessage,
            variant: "destructive"
          });
        }
      }
    } else {
      console.warn('⚠️ Browser tidak mendukung Geolocation API');
      
      if (showToast) {
        toast({
          title: t('errorGeolocation', currentLang),
          description: 'Browser tidak mendukung GPS. Mencoba metode alternatif...',
          variant: "destructive"
        });
      }
    }
    
    // Strategy 2: Fallback ke IP geolocation jika GPS gagal
    try {
      console.log('📡 GPS gagal, mencoba IP geolocation sebagai fallback...')
      const ipData = await getLocationFromIP();
      
      if (ipData && ipData.latitude && ipData.longitude) {
        const lat = parseFloat(ipData.latitude);
        const lng = parseFloat(ipData.longitude);
        
        console.log('✅ IP geolocation berhasil:', lat, lng)
        
        setLokasi({ 
          latitude: lat, 
          longitude: lng 
        });
        setSumberLokasi('ip');
        
        // Set nama lokasi dan timezone dari IP data
        if (ipData.city && ipData.country) {
          setNamaLokasi(`${ipData.city}, ${ipData.country}`);
        }
        if (ipData.timezone) {
          setZonaWaktu(ipData.timezone);
        }
        
        // Coba ambil nama lokasi yang lebih detail dari koordinat
        dapatkanNamaLokasi(lat, lng);
        
        if (showToast) {
          toast({
            title: t('locationFound', currentLang),
            description: t('usingIP', currentLang),
          });
        }
        
        setLoading(false);
        return; // Sukses, keluar dari fungsi
      }
    } catch (ipError) {
      console.warn('⚠️ IP geolocation juga gagal:', ipError);
    }
    
    // Strategy 3: Fallback terakhir ke lokasi default Jakarta (selalu berhasil)
    console.log('🏠 Semua metode gagal, menggunakan lokasi default Jakarta');
    
    setLokasi({ 
      latitude: -6.2088, 
      longitude: 106.8456 
    });
    setSumberLokasi('default');
    setNamaLokasi('Jakarta, Indonesia');
    setZonaWaktu('Asia/Jakarta');
    
    // Set prayer method untuk Indonesia
    const methodInfo = {
      method: 20, // Kemenag RI
      name: "Kementerian Agama Republik Indonesia",
      description: "Used in Indonesia",
      source: "country-specific"
    };
    setPrayerMethod(methodInfo);
    
    if (showToast) {
      toast({
        title: t('usingDefault', currentLang),
        description: "Jakarta, Indonesia",
      });
    }
    
    setLoading(false);
  }

  // Fungsi untuk mendapatkan jadwal sholat dari API
  const ambilJadwalSholat = async (lokasi) => {
    console.log('🕌 ambilJadwalSholat dipanggil dengan lokasi:', lokasi);
    setLoading(true)
    try {
      // Format tanggal untuk API
      const today = new Date()
      const dd = String(today.getDate()).padStart(2, '0')
      const mm = String(today.getMonth() + 1).padStart(2, '0')
      const yyyy = today.getFullYear()
      
      console.log('📅 Tanggal untuk API:', `${dd}-${mm}-${yyyy}`);
      
      // Determine calculation method berdasarkan lokasi
      let method = 3; // Default to Muslim World League
      if (prayerMethod && prayerMethod.method) {
        method = prayerMethod.method;
      }
      
      console.log('⚙️ Prayer method yang digunakan:', method);
      
      // Gunakan fetchWithFallback untuk AlAdhan API dengan method yang sesuai
      const apiUrl = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lokasi.latitude}&longitude=${lokasi.longitude}&method=${method}`
      
      console.log('🌐 API URL:', apiUrl);
      
      const data = await fetchWithFallback(apiUrl)
      
      console.log('📊 Response data dari API:', data);
      console.log(`Using prayer calculation method ${method} for location:`, namaLokasi);
      
      // Periksa apakah data valid
      if (!data || !data.data || !data.data.timings) {
        throw new Error('Data API tidak valid atau kosong');
      }
      
      // Ekstrak jadwal sholat dari respons
      const timings = data.data.timings
      
      console.log('⏰ Timings dari API:', timings);
      
      setJadwalSholat({
        subuh: timings.Fajr,
        dzuhur: timings.Dhuhr,
        ashar: timings.Asr,
        maghrib: timings.Maghrib,
        isya: timings.Isha
      })
      
      console.log('✅ Jadwal sholat berhasil di-set');
      
      // Hitung sholat berikutnya
      hitungSholatBerikutnya()
      
      setLoading(false)
    } catch (error) {
      console.error("❌ Error fetching prayer times:", error)
      console.error("Error details:", error.message);
      
      // PENTING: Jangan set jadwal sholat jika API gagal
      // Biarkan jadwalSholat tetap null agar UI menampilkan pesan error
      setJadwalSholat(null);
      
      toast({
        title: t('errorLoading', currentLang),
        description: `${t('errorTryAgain', currentLang)} - Pastikan koneksi internet stabil`,
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  // Fungsi untuk mendapatkan tanggal Hijriah
  const ambilTanggalHijriah = async () => {
    try {
      const today = new Date()
      const dd = String(today.getDate()).padStart(2, '0')
      const mm = String(today.getMonth() + 1).padStart(2, '0')
      const yyyy = today.getFullYear()
      
      const apiUrl = `https://api.aladhan.com/v1/gToH/${dd}-${mm}-${yyyy}`
      
      const data = await fetchWithFallback(apiUrl)
      
      // Pastikan data bulan tersedia dan gunakan nama bulan dalam bahasa Indonesia
      // Jika tidak tersedia, gunakan nomor bulan sebagai fallback
      const bulanHijriah = data.data.hijri.month && data.data.hijri.month.id 
        ? data.data.hijri.month.id 
        : data.data.hijri.month && data.data.hijri.month.en 
          ? data.data.hijri.month.en 
          : getNamaBulanHijriah(data.data.hijri.month.number);
      
      setTanggalHijriah(`${data.data.hijri.day} ${bulanHijriah} ${data.data.hijri.year}H`)
      
      console.log('Data Hijriah:', data.data.hijri); // Untuk debugging
    } catch (error) {
      console.error("Error fetching Hijri date:", error)
      setTanggalHijriah('')
    }
  }
  
  // Fungsi helper untuk mendapatkan nama bulan Hijriah dalam bahasa Indonesia
  const getNamaBulanHijriah = (nomorBulan) => {
    const namaBulan = [
      'Muharram',
      'Safar',
      'Rabiul Awal',
      'Rabiul Akhir',
      'Jumadil Awal',
      'Jumadil Akhir',
      'Rajab',
      'Sya\'ban',
      'Ramadhan',
      'Syawal',
      'Dzulqaidah',
      'Dzulhijjah'
    ];
    
    return namaBulan[nomorBulan - 1] || `Bulan ${nomorBulan}`;
  }

  // Fungsi untuk menghitung sholat berikutnya dan countdown
  const hitungSholatBerikutnya = () => {
    if (!jadwalSholat) return
    
    const now = new Date()
    const today = new Date().setHours(0, 0, 0, 0)
    
    // Konversi waktu sholat ke objek Date
    const waktuSholat = {
      subuh: new Date(today + parseTimeToMs(jadwalSholat.subuh)),
      dzuhur: new Date(today + parseTimeToMs(jadwalSholat.dzuhur)),
      ashar: new Date(today + parseTimeToMs(jadwalSholat.ashar)),
      maghrib: new Date(today + parseTimeToMs(jadwalSholat.maghrib)),
      isya: new Date(today + parseTimeToMs(jadwalSholat.isya))
    }
    
    // Tentukan sholat berikutnya
    let next = null
    let nextTime = null
    
    if (now < waktuSholat.subuh) {
      next = 'subuh'
      nextTime = waktuSholat.subuh
    } else if (now < waktuSholat.dzuhur) {
      next = 'dzuhur'
      nextTime = waktuSholat.dzuhur
    } else if (now < waktuSholat.ashar) {
      next = 'ashar'
      nextTime = waktuSholat.ashar
    } else if (now < waktuSholat.maghrib) {
      next = 'maghrib'
      nextTime = waktuSholat.maghrib
    } else if (now < waktuSholat.isya) {
      next = 'isya'
      nextTime = waktuSholat.isya
    } else {
      // Jika semua sholat hari ini sudah lewat, set ke subuh besok
      next = 'subuh'
      nextTime = new Date(waktuSholat.subuh)
      nextTime.setDate(nextTime.getDate() + 1)
    }
    
    setSholatBerikutnya(next)
    
    // Hitung countdown
    const diff = nextTime - now
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
  }

  // Fungsi untuk mengkonversi string waktu (HH:MM) ke milidetik
  const parseTimeToMs = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return (hours * 60 * 60 + minutes * 60) * 1000
  }

  // Fungsi untuk toggle tema
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // Memaksa refresh tampilan tanpa reload halaman
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    
    // Memaksa refresh stylesheet CSS
    forceStylesheetReload();
    
    // Tampilkan toast untuk konfirmasi
    toast({
      title: `${newTheme === 'dark' ? t('darkMode', currentLang) : t('lightMode', currentLang)} ${t('activated', currentLang)}`,
      description: t('displayUpdated', currentLang),
    });
    
    // Tidak perlu reload halaman, cukup perbarui state
    // window.location.reload(); -- Dihapus untuk mencegah auto refresh yang terlalu cepat
  }

  // Fungsi untuk memuat ulang data
  const refreshData = () => {
    dapatkanLokasi()
  }

  // Fungsi untuk set lokasi manual
  const setLokasiManual = (latitude, longitude, namaLokasi) => {
    setLokasi({ latitude, longitude });
    setSumberLokasi('manual');
    setNamaLokasi(namaLokasi);
    setShowLocationPicker(false);
    
    // Dapatkan nama lokasi yang lebih detail dan prayer method
    dapatkanNamaLokasi(latitude, longitude);
    
    toast({
      title: t('locationFound', currentLang),
      description: `Manual: ${namaLokasi}`,
    });
  }

  // Fungsi untuk memformat waktu dengan zona waktu yang benar
  const formatWaktu = (date) => {
    // Gunakan zona waktu dari lokasi jika tersedia, jika tidak gunakan zona waktu lokal
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: zonaWaktu || Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    
    return formatLocalizedTime(date, currentLang, options);
  }

  // Fungsi untuk memformat tanggal dengan zona waktu yang benar
  const formatTanggal = (date) => {
    // Gunakan zona waktu dari lokasi jika tersedia, jika tidak gunakan zona waktu lokal
    const options = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: zonaWaktu || Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    
    return formatLocalizedDate(date, currentLang, options);
  }
  
  // Fungsi untuk mendapatkan nama lokasi dan country info berdasarkan koordinat
  const dapatkanNamaLokasi = async (latitude, longitude) => {
    try {
      // Gunakan Nominatim OpenStreetMap API untuk reverse geocoding
      const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`;
      
      const response = await fetchWithFallback(apiUrl);
      
      // Periksa apakah respons valid dan memiliki data address
      if (response && response.address) {
        const address = response.address;
        let lokasiText = '';
        
        // Prioritaskan kota, kabupaten, atau provinsi
        if (address.city) {
          lokasiText = address.city;
        } else if (address.town) {
          lokasiText = address.town;
        } else if (address.county) {
          lokasiText = address.county;
        } else if (address.state) {
          lokasiText = address.state;
        }
        
        // Tambahkan negara jika tersedia
        if (address.country) {
          lokasiText = lokasiText ? `${lokasiText}, ${address.country}` : address.country;
        }
        
        // Set country information untuk prayer method calculation
        if (address.country_code && address.country) {
          const continent = getContinentFromCoordinates(latitude, longitude);
          const methodInfo = getCalculationMethod(address.country_code.toUpperCase(), continent);
          
          setCountryInfo({
            countryCode: address.country_code.toUpperCase(),
            countryName: address.country,
            continent: continent
          });
          
          setPrayerMethod(methodInfo);
          
          console.log('Prayer method selected:', methodInfo);
        }
        
        if (lokasiText) {
          setNamaLokasi(lokasiText);
          console.log('Nama lokasi ditemukan:', lokasiText);
        } else {
          // Fallback ke koordinat jika nama lokasi tidak tersedia
          setNamaLokasi(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
      } else {
        // Fallback ke koordinat jika respons tidak valid
        setNamaLokasi(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        
        // Set default prayer method untuk unknown location
        const continent = getContinentFromCoordinates(latitude, longitude);
        const methodInfo = getCalculationMethod('UNKNOWN', continent);
        setPrayerMethod(methodInfo);
      }
    } catch (error) {
      console.error('Error mendapatkan nama lokasi:', error);
      // Fallback ke koordinat jika nama lokasi tidak tersedia
      setNamaLokasi(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      
      // Set default prayer method untuk error case
      const continent = getContinentFromCoordinates(latitude, longitude);
      const methodInfo = getCalculationMethod('UNKNOWN', continent);
      setPrayerMethod(methodInfo);
    }
  };
  
  // Fungsi untuk mendapatkan zona waktu berdasarkan koordinat
  const dapatkanZonaWaktu = async (latitude, longitude) => {
    try {
      // Production API configuration dengan environment variables
      const TIMEZONE_DB_KEY = process.env.REACT_APP_TIMEZONE_DB_KEY;
      const GEONAMES_USERNAME = process.env.REACT_APP_GEONAMES_USERNAME;
      
      // Coba beberapa API zona waktu secara berurutan
      const apiList = [];
      
      // Hanya tambahkan API jika key tersedia
      if (TIMEZONE_DB_KEY && TIMEZONE_DB_KEY !== 'your_timezone_db_api_key_here') {
        apiList.push(`https://api.timezonedb.com/v2.1/get-time-zone?key=${TIMEZONE_DB_KEY}&format=json&by=position&lat=${latitude}&lng=${longitude}`);
      }
      
      if (GEONAMES_USERNAME && GEONAMES_USERNAME !== 'your_geonames_username_here') {
        apiList.push(`https://secure.geonames.org/timezoneJSON?lat=${latitude}&lng=${longitude}&username=${GEONAMES_USERNAME}`);
      }
      
      // Fallback API yang tidak memerlukan key
      apiList.push(`https://worldtimeapi.org/api/timezone`); // Backup API
      
      // Coba setiap API secara berurutan
      for (const apiUrl of apiList) {
        try {
          const response = await fetchWithFallback(apiUrl);
          
          if (response) {
            // Format respons TimeZoneDB
            if (response.status === 'OK' && response.zoneName) {
              setZonaWaktu(response.zoneName);
              console.log('Zona waktu terdeteksi (TimeZoneDB):', response.zoneName);
              return;
            }
            
            // Format respons GeoNames
            if (response.timezoneId) {
              setZonaWaktu(response.timezoneId);
              console.log('Zona waktu terdeteksi (GeoNames):', response.timezoneId);
              return;
            }
          }
        } catch (apiError) {
          console.warn(`API zona waktu gagal:`, apiError);
          // Lanjutkan ke API berikutnya
        }
      }
      
      // Jika semua API gagal, gunakan perkiraan zona waktu berdasarkan longitude
      // Ini adalah fallback sederhana yang tidak akurat untuk semua kasus
      const estimatedTimezone = estimateTimezoneFromLongitude(longitude);
      setZonaWaktu(estimatedTimezone);
      console.log('Menggunakan perkiraan zona waktu:', estimatedTimezone);
    } catch (error) {
      console.error('Error mendapatkan zona waktu:', error);
      // Fallback ke zona waktu default browser
      const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setZonaWaktu(browserTimezone);
      console.log('Fallback ke zona waktu browser:', browserTimezone);
    }
  }
  
  // Fungsi helper untuk memperkirakan zona waktu berdasarkan longitude
  // Ini adalah perkiraan kasar dan tidak memperhitungkan batas politik
  const estimateTimezoneFromLongitude = (longitude) => {
    // Perkiraan zona waktu berdasarkan longitude
    // Setiap 15 derajat ≈ 1 jam perbedaan dari UTC
    const timezoneHour = Math.round(longitude / 15);
    
    // Untuk Indonesia, kita bisa membuat perkiraan yang lebih baik
    if (longitude >= 95 && longitude <= 141) {
      if (longitude < 107.5) return 'Asia/Jakarta';      // WIB (UTC+7)
      else if (longitude < 120) return 'Asia/Makassar';  // WITA (UTC+8)
      else return 'Asia/Jayapura';                       // WIT (UTC+9)
    }
    
    // Untuk lokasi lain, gunakan perkiraan umum
    const prefix = timezoneHour >= 0 ? '+' : '';
    return `Etc/GMT${prefix}${-timezoneHour}`; // Perhatikan tanda negatif karena konvensi Etc/GMT
  }

  // Jika masih dalam loading awal, tampilkan splash screen
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-full max-w-md text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
              <Clock className="h-8 w-8 text-primary animate-spin-slow" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">{t('splashTitle', currentLang)}</h1>
          <p className="text-muted-foreground">{t('splashSubtitle', currentLang)}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md animate-fadeIn">
        <Card className="w-full shadow-lg border border-primary/20 animate-glow overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('cardTitle', currentLang)}</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={refreshData}>
                <RefreshCw className="h-5 w-5" />
              </Button>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
                aria-label="Toggle dark mode"
              />
              {theme === 'dark' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Waktu dan Tanggal */}
            <div className="mb-6 text-center animate-slideUp">
              <h2 className="text-3xl font-bold mb-1 tracking-tight">
                {formatWaktu(waktuSekarang)}
              </h2>
              <p className="text-muted-foreground">
                {formatTanggal(waktuSekarang)}
              </p>
              {tanggalHijriah && (
                <p className="text-sm text-muted-foreground italic">{tanggalHijriah}</p>
              )}
            </div>

            {/* Lokasi */}
            <div className="flex items-center justify-center mb-6 text-sm animate-slideUp" style={{animationDelay: '150ms'}}>
              <MapPin className="h-4 w-4 mr-1 text-primary" />
              {sumberLokasi === 'loading' ? (
                <Skeleton className="h-4 w-40" />
              ) : (
                <div className="flex flex-col items-center">
                  <span className="font-medium">
                    {namaLokasi || (lokasi ? `${lokasi.latitude.toFixed(4)}, ${lokasi.longitude.toFixed(4)}` : 'Lokasi tidak tersedia')} 
                    <span className="text-xs text-muted-foreground ml-1 bg-secondary/50 px-1.5 py-0.5 rounded-full">
                      {sumberLokasi === 'gps' ? 'GPS' : sumberLokasi === 'ip' ? 'IP' : sumberLokasi === 'manual' ? 'Manual' : 'Default'}
                    </span>
                  </span>
                  {/* Tampilkan koordinat di bawah nama lokasi */}
                  {lokasi && (
                    <span className="text-xs text-muted-foreground mt-1">
                      {`${lokasi.latitude.toFixed(4)}, ${lokasi.longitude.toFixed(4)}`}
                    </span>
                  )}
                  {/* Tampilkan zona waktu jika tersedia */}
                  {zonaWaktu && (
                    <span className="text-xs text-primary/70 mt-0.5">
                      {zonaWaktu.replace('_', ' ')}
                    </span>
                  )}
                  {/* Tombol untuk pilih lokasi manual */}
                  <button 
                    onClick={() => setShowLocationPicker(true)}
                    className="text-xs text-primary hover:text-primary/80 mt-1 underline"
                  >
                    Ubah Lokasi
                  </button>
                </div>
              )}
            </div>

            {/* Waktu Sholat Berikutnya */}
            {loading ? (
              <div className="mb-6">
                <Skeleton className="h-8 w-48 mx-auto mb-2" />
                <Skeleton className="h-12 w-32 mx-auto" />
              </div>
            ) : sholatBerikutnya && (
              <div className="mb-6 text-center animate-slideUp" style={{animationDelay: '300ms'}}>
                <h3 className="text-lg font-medium mb-1">
                  {getPrayerName(sholatBerikutnya)} {t('nextPrayer', currentLang)}
                </h3>
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-green-400 to-primary bg-[length:200%_auto] animate-gradient animate-pulse">
                  {countdown}
                </div>
              </div>
            )}

            {/* Jadwal Sholat */}
            <div className="space-y-3 animate-slideUp" style={{animationDelay: '450ms'}}>
              {loading ? (
                <>
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </>
              ) : jadwalSholat ? (
                <>
                  {Object.entries(jadwalSholat).map(([key, time], index) => (
                    <div 
                      key={key}
                      className={`flex justify-between items-center p-3 rounded-md shadow-sm hover:translate-x-1 transition-all duration-200 ${
                        sholatBerikutnya === key 
                          ? 'bg-primary/10 border border-primary hover:-translate-y-1 hover:shadow-md' 
                          : 'bg-card hover:bg-secondary/50'
                      }`}
                      style={{animationDelay: `${450 + (index * 100)}ms`}}
                    >
                      <span className="font-medium capitalize flex items-center">
                        <PrayerIcon prayerType={key} />
                        {getPrayerName(key)}
                      </span>
                      <span className={`${sholatBerikutnya === key ? 'font-bold text-primary' : ''} bg-background/80 px-2 py-0.5 rounded`}>
                        {time}
                      </span>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center text-muted-foreground p-4 border border-dashed rounded-md">
                  <div className="mb-2">⚠️ {t('errorLoading', currentLang)}</div>
                  <div className="text-sm">Tidak ada jadwal sholat tersedia. Silakan periksa koneksi internet dan coba lagi.</div>
                  <button 
                    onClick={refreshData}
                    className="mt-2 text-primary hover:text-primary/80 text-sm underline"
                  >
                    🔄 Coba Lagi
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-muted-foreground animate-slideUp" style={{animationDelay: '950ms'}}>
              <div className="flex items-center justify-center mb-1">
                <svg className="w-4 h-4 mr-1 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span>{t('copyright', currentLang)}</span>
              </div>
              <div className="text-primary/70 font-medium">
                {prayerMethod ? (
                  <>
                    {t('usingMethod', currentLang)} {formatMethodDisplay(prayerMethod, countryInfo?.countryName)}
                    {countryInfo && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {countryInfo.continent} • {t('method', currentLang)} {prayerMethod.method}
                      </div>
                    )}
                  </>
                ) : (
                  t('loadingText', currentLang)
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Location Picker Modal */}
        {showLocationPicker && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Pilih Lokasi
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowLocationPicker(false)}
                  >
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Kota-kota populer Indonesia */}
                <div>
                  <h4 className="font-medium mb-2">Indonesia</h4>
                  <div className="space-y-1">
                    {[
                      { nama: 'Jakarta', lat: -6.2088, lng: 106.8456 },
                      { nama: 'Surabaya', lat: -7.2575, lng: 112.7521 },
                      { nama: 'Bandung', lat: -6.9175, lng: 107.6191 },
                      { nama: 'Medan', lat: 3.5952, lng: 98.6722 },
                      { nama: 'Semarang', lat: -6.9667, lng: 110.4167 },
                      { nama: 'Makassar', lat: -5.1477, lng: 119.4327 },
                      { nama: 'Palembang', lat: -2.9761, lng: 104.7754 },
                      { nama: 'Yogyakarta', lat: -7.7956, lng: 110.3695 }
                    ].map((kota) => (
                      <button
                        key={kota.nama}
                        onClick={() => setLokasiManual(kota.lat, kota.lng, `${kota.nama}, Indonesia`)}
                        className="w-full text-left p-2 hover:bg-secondary rounded text-sm"
                      >
                        {kota.nama}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Kota-kota internasional populer */}
                <div>
                  <h4 className="font-medium mb-2">International</h4>
                  <div className="space-y-1">
                    {[
                      { nama: 'Mecca, Saudi Arabia', lat: 21.4225, lng: 39.8262 },
                      { nama: 'Medina, Saudi Arabia', lat: 24.4539, lng: 39.6040 },
                      { nama: 'Kuala Lumpur, Malaysia', lat: 3.1390, lng: 101.6869 },
                      { nama: 'Singapore', lat: 1.3521, lng: 103.8198 },
                      { nama: 'Bangkok, Thailand', lat: 13.7563, lng: 100.5018 },
                      { nama: 'London, UK', lat: 51.5074, lng: -0.1278 },
                      { nama: 'New York, USA', lat: 40.7128, lng: -74.0060 },
                      { nama: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
                      { nama: 'Dubai, UAE', lat: 25.2048, lng: 55.2708 },
                      { nama: 'Istanbul, Turkey', lat: 41.0082, lng: 28.9784 }
                    ].map((kota) => (
                      <button
                        key={kota.nama}
                        onClick={() => setLokasiManual(kota.lat, kota.lng, kota.nama)}
                        className="w-full text-left p-2 hover:bg-secondary rounded text-sm"
                      >
                        {kota.nama}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Tombol coba deteksi otomatis lagi */}
                <div className="pt-3 border-t">
                  <Button 
                    onClick={() => {
                      setShowLocationPicker(false);
                      dapatkanLokasi();
                    }}
                    variant="outline" 
                    className="w-full"
                  >
                    🔄 Coba Deteksi Otomatis Lagi
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
