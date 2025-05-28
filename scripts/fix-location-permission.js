// Script perbaikan untuk masalah permintaan izin lokasi
// Gunakan sebagai referensi untuk memperbaiki App.jsx

/**
 * Fungsi yang benar untuk mendapatkan lokasi pengguna
 * Copy dan paste ke App.jsx untuk menggantikan fungsi dapatkanLokasi yang ada
 */
const dapatkanLokasi = async (showToast = true) => {
  setLoading(true);
  setSumberLokasi('loading');
  
  // Tampilkan toast untuk memberi tahu pengguna tentang permintaan lokasi
  if (showToast) {
    toast({
      title: "Meminta izin lokasi",
      description: "Silakan izinkan akses lokasi untuk hasil yang akurat",
    });
  }
  
  // Coba dapatkan lokasi dari Geolocation API
  if (navigator.geolocation) {
    try {
      // Buat Promise untuk menangani getCurrentPosition dengan timeout yang lebih lama
      const getPositionPromise = new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position),
          (error) => reject(error),
          { 
            enableHighAccuracy: true, // Gunakan akurasi tinggi
            timeout: 15000,          // Timeout 15 detik (lebih lama)
            maximumAge: 0            // Selalu dapatkan posisi terbaru
          }
        );
      });
      
      // Tunggu hasil dengan timeout yang lebih lama
      const position = await getPositionPromise;
      
      const { latitude, longitude } = position.coords;
      setLokasi({ latitude, longitude });
      setSumberLokasi('gps');
      
      // Dapatkan nama lokasi dan zona waktu berdasarkan koordinat
      dapatkanNamaLokasi(latitude, longitude);
      
      if (showToast) {
        toast({
          title: "Lokasi ditemukan",
          description: "Menggunakan GPS perangkat Anda",
        });
      }
    } catch (error) {
      console.warn("Geolocation error:", error);
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
    }
  } else {
    // Browser tidak mendukung Geolocation
    setLokasi({ 
      latitude: -6.2088, 
      longitude: 106.8456 
    });
    setSumberLokasi('default');
    setNamaLokasi('Jakarta, Indonesia');
    setZonaWaktu('Asia/Jakarta');
    if (showToast) {
      toast({
        title: "Geolocation tidak didukung",
        description: "Browser Anda tidak mendukung geolocation",
        variant: "destructive"
      });
    }
  }
};
