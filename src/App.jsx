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

  // Efek untuk mendapatkan lokasi saat komponen dimuat
  useEffect(() => {
    dapatkanLokasi()
  }, [])

  // Efek untuk mendapatkan jadwal sholat saat lokasi berubah
  useEffect(() => {
    if (lokasi) {
      ambilJadwalSholat(lokasi)
      ambilTanggalHijriah()
    }
  }, [lokasi])

  // Fungsi untuk mendapatkan lokasi pengguna
  const dapatkanLokasi = async () => {
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
            toast({
              title: "Lokasi ditemukan",
              description: "Menggunakan GPS perangkat Anda",
            })
          },
          async (error) => {
            console.warn("Geolocation error:", error)
            // Fallback ke IP geolocation
            try {
              const response = await fetch('https://ipinfo.io/json?token=YOUR_TOKEN')
              const data = await response.json()
              const [lat, lon] = data.loc.split(',')
              setLokasi({ 
                latitude: parseFloat(lat), 
                longitude: parseFloat(lon) 
              })
              setSumberLokasi('ip')
              toast({
                title: "Menggunakan lokasi berdasarkan IP",
                description: "Izinkan akses lokasi untuk hasil yang lebih akurat",
              })
            } catch (ipError) {
              console.error("IP Geolocation error:", ipError)
              // Fallback ke lokasi default (Jakarta)
              setLokasi({ 
                latitude: -6.2088, 
                longitude: 106.8456 
              })
              setSumberLokasi('default')
              toast({
                title: "Menggunakan lokasi default",
                description: "Lokasi diatur ke Jakarta",
                variant: "destructive"
              })
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
      toast({
        title: "Geolocation tidak didukung",
        description: "Browser Anda tidak mendukung geolocation",
        variant: "destructive"
      })
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
      <div className="w-full max-w-md">
        <Card className="w-full">
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
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold mb-1">
                {formatWaktu(waktuSekarang)}
              </h2>
              <p className="text-muted-foreground">
                {formatTanggal(waktuSekarang)}
              </p>
              {tanggalHijriah && (
                <p className="text-sm text-muted-foreground">{tanggalHijriah}</p>
              )}
            </div>

            {/* Lokasi */}
            <div className="flex items-center justify-center mb-6 text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              {sumberLokasi === 'loading' ? (
                <Skeleton className="h-4 w-40" />
              ) : (
                <span>
                  {lokasi ? `${lokasi.latitude.toFixed(4)}, ${lokasi.longitude.toFixed(4)}` : 'Lokasi tidak tersedia'} 
                  <span className="text-xs text-muted-foreground ml-1">
                    ({sumberLokasi === 'gps' ? 'GPS' : sumberLokasi === 'ip' ? 'IP' : 'Default'})
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
              <div className="mb-6 text-center">
                <h3 className="text-lg font-medium mb-1">
                  {sholatBerikutnya.charAt(0).toUpperCase() + sholatBerikutnya.slice(1)} dalam
                </h3>
                <div className="text-4xl font-bold text-primary">
                  {countdown}
                </div>
              </div>
            )}

            {/* Jadwal Sholat */}
            <div className="space-y-3">
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
                  {Object.entries(jadwalSholat).map(([key, time]) => (
                    <div 
                      key={key}
                      className={`flex justify-between items-center p-3 rounded-md ${
                        sholatBerikutnya === key 
                          ? 'bg-primary/10 border border-primary' 
                          : 'bg-card'
                      }`}
                    >
                      <span className="font-medium capitalize">
                        {key}
                      </span>
                      <span className={`${sholatBerikutnya === key ? 'font-bold' : ''}`}>
                        {time}
                      </span>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center text-muted-foreground">
                  Tidak dapat memuat jadwal sholat
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-muted-foreground">
              <p>Waktu Solat &copy; {new Date().getFullYear()}</p>
              <p className="mt-1">Menggunakan metode perhitungan Kementerian Agama RI</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App
