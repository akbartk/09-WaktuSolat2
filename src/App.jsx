import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Switch } from './components/ui/switch'
import { Skeleton } from './components/ui/skeleton'
import { useTheme } from './components/theme-provider'
import { useToast } from './components/ui/use-toast'
import { Clock, MapPin, Moon, Sun, RefreshCw } from 'lucide-react'
import { forceStylesheetReload } from './forceRefresh'

function App() {
  // State untuk data aplikasi
  const [waktuSekarang, setWaktuSekarang] = useState(new Date())
  const [lokasi, setLokasi] = useState(null)
  const [jadwalSholat, setJadwalSholat] = useState(null)
  const [tanggalHijriah, setTanggalHijriah] = useState('')
  const [loading, setLoading] = useState(true)
  const [sumberLokasi, setSumberLokasi] = useState('loading')
  const [sholatBerikutnya, setSholatBerikutnya] = useState(null)
  const [countdown, setCountdown] = useState('')
  
  // Hooks untuk tema dan toast
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  // Efek untuk update waktu setiap detik
  useEffect(() => {
    const interval = setInterval(() => {
      setWaktuSekarang(new Date())
      if (jadwalSholat) {
        hitungSholatBerikutnya()
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [jadwalSholat])
  
  // Efek untuk memaksa refresh stylesheet CSS saat aplikasi dimuat
  useEffect(() => {
    // Tunggu sebentar untuk memastikan DOM sudah siap
    setTimeout(() => {
      forceStylesheetReload();
      console.log('Stylesheet di-refresh saat aplikasi dimuat');
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
            if (showToast) {
              toast({
                title: "Lokasi ditemukan",
                description: "Menggunakan GPS perangkat Anda",
              })
            }
          },
          async (error) => {
            console.warn("Geolocation error:", error)
            // Fallback ke IP geolocation tanpa token (free tier)
            try {
              const response = await fetch('https://ipapi.co/json/')
              const data = await response.json()
              if (data && data.latitude && data.longitude) {
                setLokasi({ 
                  latitude: parseFloat(data.latitude), 
                  longitude: parseFloat(data.longitude) 
                })
                setSumberLokasi('ip')
                if (showToast) {
                  toast({
                    title: "Menggunakan lokasi berdasarkan IP",
                    description: "Izinkan akses lokasi untuk hasil yang lebih akurat",
                  })
                }
              } else {
                throw new Error('Tidak dapat mendapatkan lokasi dari IP')
              }
            } catch (ipError) {
              console.error("IP Geolocation error:", ipError)
              // Fallback ke lokasi default (Jakarta)
              setLokasi({ 
                latitude: -6.2088, 
                longitude: 106.8456 
              })
              setSumberLokasi('default')
              if (showToast) {
                toast({
                  title: "Menggunakan lokasi default",
                  description: "Lokasi diatur ke Jakarta",
                  variant: "destructive"
                })
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
      }
    } else {
      // Browser tidak mendukung Geolocation
      setLokasi({ 
        latitude: -6.2088, 
        longitude: 106.8456 
      })
      setSumberLokasi('default')
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
      
      // Gunakan AlAdhan API
      const url = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lokasi.latitude}&longitude=${lokasi.longitude}&method=20`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Gagal mendapatkan jadwal sholat')
      }
      
      const data = await response.json()
      
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
      
      const url = `https://api.aladhan.com/v1/gToH/${dd}-${mm}-${yyyy}`
      
      const response = await fetch(url)
      const data = await response.json()
      
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
    
    // Memaksa refresh tampilan
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    
    // Memaksa refresh stylesheet CSS
    forceStylesheetReload();
    
    // Tampilkan toast untuk konfirmasi
    toast({
      title: `Tema ${newTheme === 'dark' ? 'Gelap' : 'Terang'} diaktifkan`,
      description: "Tampilan telah diperbarui",
    });
    
    // Reload halaman untuk memastikan perubahan diterapkan
    window.location.reload();
  }

  // Fungsi untuk memuat ulang data
  const refreshData = () => {
    dapatkanLokasi()
  }

  // Fungsi untuk memformat waktu
  const formatWaktu = (date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  // Fungsi untuk memformat tanggal
  const formatTanggal = (date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
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
                <span>
                  {lokasi ? `${lokasi.latitude.toFixed(4)}, ${lokasi.longitude.toFixed(4)}` : 'Lokasi tidak tersedia'} 
                  <span className="text-xs text-muted-foreground ml-1 bg-secondary/50 px-1.5 py-0.5 rounded-full">
                    {sumberLokasi === 'gps' ? 'GPS' : sumberLokasi === 'ip' ? 'IP' : 'Default'}
                  </span>
                </span>
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
                        {key === 'subuh' && <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" /></svg>}
                        {key === 'dzuhur' && <svg className="w-4 h-4 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" /></svg>}
                        {key === 'ashar' && <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" /></svg>}
                        {key === 'maghrib' && <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" /></svg>}
                        {key === 'isya' && <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
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
