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
  
  // Hooks untuk tema dan toast
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

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

  // Fungsi untuk mendapatkan lokasi pengguna
  const dapatkanLokasi = async (showToast = true) => {
    setLoading(true)
    setSumberLokasi('loading')
    
    // Coba dapatkan lokasi dari Geolocation API
    if (navigator.geolocation) {
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            setLokasi({ latitude, longitude })
            setSumberLokasi('gps')
            
            // Dapatkan nama lokasi dan zona waktu berdasarkan koordinat
            dapatkanNamaLokasi(latitude, longitude)
            
            if (showToast) {
              toast({
                title: "Lokasi ditemukan",
                description: "Menggunakan GPS perangkat Anda",
              })
            }
          },
          async (error) => {
            console.warn("Geolocation error:", error)
            // Fallback ke IP geolocation dengan mencoba beberapa API
            try {
              // Gunakan fungsi getLocationFromIP yang lebih handal
              const ipData = await getLocationFromIP();
              
              if (ipData && ipData.latitude && ipData.longitude) {
                const lat = parseFloat(ipData.latitude);
                const lng = parseFloat(ipData.longitude);
                
                setLokasi({ 
                  latitude: lat, 
                  longitude: lng 
                });
                setSumberLokasi('ip');
                
                // Jika data memiliki informasi kota dan negara, gunakan itu
                if (ipData.city && ipData.country) {
                  setNamaLokasi(`${ipData.city}, ${ipData.country}`);
                  // Jika sudah mendapatkan nama lokasi, tidak perlu memanggil dapatkanNamaLokasi
                } else {
                  // Dapatkan nama lokasi dan zona waktu berdasarkan koordinat jika tidak ada di respons API
                  dapatkanNamaLokasi(lat, lng);
                }
                
                // Jika data memiliki informasi timezone, gunakan itu
                if (ipData.timezone) {
                  setZonaWaktu(ipData.timezone);
                } else {
                  // Dapatkan zona waktu berdasarkan koordinat jika tidak ada di respons API
                  dapatkanZonaWaktu(lat, lng);
                }
                
                if (showToast) {
                  toast({
                    title: "Menggunakan lokasi berdasarkan IP",
                    description: "Izinkan akses lokasi untuk hasil yang lebih akurat",
                  });
                }
              } else {
                throw new Error('Tidak dapat mendapatkan lokasi dari IP');
              }
            } catch (ipError) {
              console.error("IP Geolocation error:", ipError);
              // Fallback ke lokasi default (Jakarta)
              setLokasi({ 
                latitude: -6.2088, 
                longitude: 106.8456 
              });
              setSumberLokasi('default');
              setNamaLokasi('Jakarta, Indonesia');
              setZonaWaktu('Asia/Jakarta');
              
              if (showToast) {
                toast({
                  title: "Menggunakan lokasi default",
                  description: "Lokasi diatur ke Jakarta",
                  variant: "destructive"
                });
              }
            }
          },
          { timeout: 5000 }
        )
      } catch (error) {
        console.error("Geolocation error:", error)
        setLokasi({ 
          latitude: -6.2088, 
          longitude: 106.8456 
        })
        setSumberLokasi('default')
        setNamaLokasi('Jakarta, Indonesia')
        setZonaWaktu('Asia/Jakarta')
      }
    } else {
      // Browser tidak mendukung Geolocation
      setLokasi({ 
        latitude: -6.2088, 
        longitude: 106.8456 
      })
      setSumberLokasi('default')
      setNamaLokasi('Jakarta, Indonesia')
      setZonaWaktu('Asia/Jakarta')
      if (showToast) {
        toast({
          title: "Geolocation tidak didukung",
          description: "Browser Anda tidak mendukung geolocation",
          variant: "destructive"
        })
      }
    }
  }

  // Fungsi untuk mendapatkan jadwal sholat dari API
  const ambilJadwalSholat = async (lokasi) => {
    setLoading(true)
    try {
      // Format tanggal untuk API
      const today = new Date()
      const dd = String(today.getDate()).padStart(2, '0')
      const mm = String(today.getMonth() + 1).padStart(2, '0')
      const yyyy = today.getFullYear()
      
      // Gunakan fetchWithFallback untuk AlAdhan API
      const apiUrl = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lokasi.latitude}&longitude=${lokasi.longitude}&method=20`
      
      const data = await fetchWithFallback(apiUrl)
      
      // Ekstrak jadwal sholat dari respons
      const timings = data.data.timings
      
      setJadwalSholat({
        subuh: timings.Fajr,
        dzuhur: timings.Dhuhr,
        ashar: timings.Asr,
        maghrib: timings.Maghrib,
        isya: timings.Isha
      })
      
      // Hitung sholat berikutnya
      hitungSholatBerikutnya()
      
      setLoading(false)
    } catch (error) {
      console.error("Error fetching prayer times:", error)
      toast({
        title: "Gagal mendapatkan jadwal sholat",
        description: "Silakan coba lagi nanti",
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
      title: `Tema ${newTheme === 'dark' ? 'Gelap' : 'Terang'} diaktifkan`,
      description: "Tampilan telah diperbarui",
    });
    
    // Tidak perlu reload halaman, cukup perbarui state
    // window.location.reload(); -- Dihapus untuk mencegah auto refresh yang terlalu cepat
  }

  // Fungsi untuk memuat ulang data
  const refreshData = () => {
    dapatkanLokasi()
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
    
    return date.toLocaleTimeString('id-ID', options);
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
    
    return date.toLocaleDateString('id-ID', options);
  }
  
  // Fungsi untuk mendapatkan nama lokasi berdasarkan koordinat
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
      }
    } catch (error) {
      console.error('Error mendapatkan nama lokasi:', error);
      // Fallback ke koordinat jika nama lokasi tidak tersedia
      setNamaLokasi(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    }
  };
  
  // Fungsi untuk mendapatkan zona waktu berdasarkan koordinat
  const dapatkanZonaWaktu = async (latitude, longitude) => {
    try {
      // Coba beberapa API zona waktu secara berurutan
      const apiList = [
        // TimeZoneDB API
        `https://api.timezonedb.com/v2.1/get-time-zone?key=VGQJNBVDQBGC&format=json&by=position&lat=${latitude}&lng=${longitude}`,
        // GeoNames API (alternatif)
        `https://secure.geonames.org/timezoneJSON?lat=${latitude}&lng=${longitude}&username=akbartk`
      ];
      
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
          <h1 className="text-2xl font-bold mb-2">Jadwal Sholat</h1>
          <p className="text-muted-foreground">Memuat data waktu sholat...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md animate-fadeIn">
        <Card className="w-full shadow-lg border border-primary/20 animate-glow overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Jadwal Sholat</CardTitle>
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
                      {sumberLokasi === 'gps' ? 'GPS' : sumberLokasi === 'ip' ? 'IP' : 'Default'}
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
                  {sholatBerikutnya.charAt(0).toUpperCase() + sholatBerikutnya.slice(1)} dalam
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
                        {/* Menggunakan komponen ikon yang lebih sederhana dan teroptimasi */}
                        {key === 'subuh' && (
                          <span className="w-5 h-5 mr-2 flex items-center justify-center text-blue-500">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="4"/>
                              <path d="M12 2v2"/>
                              <path d="M12 20v2"/>
                              <path d="m4.93 4.93 1.41 1.41"/>
                              <path d="m17.66 17.66 1.41 1.41"/>
                              <path d="M2 12h2"/>
                              <path d="M20 12h2"/>
                              <path d="m6.34 17.66-1.41 1.41"/>
                              <path d="m19.07 4.93-1.41 1.41"/>
                            </svg>
                          </span>
                        )}
                        {key === 'dzuhur' && (
                          <span className="w-5 h-5 mr-2 flex items-center justify-center text-yellow-500">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="4"/>
                              <path d="M12 2v2"/>
                              <path d="M12 20v2"/>
                              <path d="m4.93 4.93 1.41 1.41"/>
                              <path d="m17.66 17.66 1.41 1.41"/>
                              <path d="M2 12h2"/>
                              <path d="M20 12h2"/>
                              <path d="m6.34 17.66-1.41 1.41"/>
                              <path d="m19.07 4.93-1.41 1.41"/>
                            </svg>
                          </span>
                        )}
                        {key === 'ashar' && (
                          <span className="w-5 h-5 mr-2 flex items-center justify-center text-orange-500">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="4"/>
                              <path d="M12 2v2"/>
                              <path d="M12 20v2"/>
                              <path d="m4.93 4.93 1.41 1.41"/>
                              <path d="m17.66 17.66 1.41 1.41"/>
                              <path d="M2 12h2"/>
                              <path d="M20 12h2"/>
                              <path d="m6.34 17.66-1.41 1.41"/>
                              <path d="m19.07 4.93-1.41 1.41"/>
                            </svg>
                          </span>
                        )}
                        {key === 'maghrib' && (
                          <span className="w-5 h-5 mr-2 flex items-center justify-center text-red-500">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 3a6 6 0 0 0-6 9h12a6 6 0 0 0-6-9Z"/>
                              <path d="M6 12h12"/>
                              <path d="M6 16h12"/>
                              <path d="M6 20h12"/>
                            </svg>
                          </span>
                        )}
                        {key === 'isya' && (
                          <span className="w-5 h-5 mr-2 flex items-center justify-center text-indigo-500">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                            </svg>
                          </span>
                        )}
                        {key}
                      </span>
                      <span className={`${sholatBerikutnya === key ? 'font-bold text-primary' : ''} bg-background/80 px-2 py-0.5 rounded`}>
                        {time}
                      </span>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center text-muted-foreground p-4 border border-dashed rounded-md">
                  Tidak dapat memuat jadwal sholat
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-muted-foreground animate-slideUp" style={{animationDelay: '950ms'}}>
              <div className="flex items-center justify-center mb-1">
                <svg className="w-4 h-4 mr-1 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span>Waktu Solat AkbarTK © 2025</span>
              </div>
              <div className="text-primary/70 font-medium">
                Menggunakan metode perhitungan Kementerian Agama RI
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App
