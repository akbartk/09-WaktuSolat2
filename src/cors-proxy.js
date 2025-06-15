// Production CORS Proxy Handler dengan environment-aware configuration

// Production environment configuration
const PRODUCTION_CONFIG = {
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '10000'),
  userAgent: `WaktuSolat App v${process.env.REACT_APP_VERSION || '2.0.0'} (${process.env.REACT_APP_ENVIRONMENT || 'production'})`,
  retryAttempts: 3,
  retryDelay: 1000
};

// Daftar proxy CORS yang tersedia - Production grade
const proxyList = [
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://proxy.cors.sh/${url}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  // Removed unreliable proxies for production stability
];

// Fungsi untuk mencoba beberapa proxy secara berurutan
export const corsProxy = async (url) => {
  // Coba langsung tanpa proxy terlebih dahulu
  try {
    const directResponse = await fetch(url, { 
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'User-Agent': PRODUCTION_CONFIG.userAgent
      }
    });
    if (directResponse.ok) {
      console.log('Direct request successful');
      return url;
    }
  } catch (error) {
    console.warn('Direct request failed, trying proxies:', error.message);
  }

  // Coba setiap proxy secara berurutan
  for (let i = 0; i < proxyList.length; i++) {
    const proxiedUrl = proxyList[i](url);
    try {
      const response = await fetch(proxiedUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': PRODUCTION_CONFIG.userAgent
        }
      });
      if (response.ok) {
        console.log(`Proxy ${i+1} successful`);
        return proxiedUrl;
      }
    } catch (error) {
      console.warn(`Proxy ${i+1} failed:`, error.message);
      // Lanjutkan ke proxy berikutnya
    }
  }

  // Jika semua proxy gagal, kembalikan URL asli sebagai fallback terakhir
  console.warn('All proxies failed, returning original URL');
  return url;
};

// Fungsi helper untuk mencoba beberapa URL secara berurutan
export const fetchWithFallback = async (url) => {
  try {
    const proxiedUrl = await corsProxy(url);
    const response = await fetch(proxiedUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': PRODUCTION_CONFIG.userAgent
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching with proxy:', error.message);
    // Kembalikan objek kosong sebagai fallback agar aplikasi tidak crash
    return {};
  }
};

// Fungsi alternatif untuk mendapatkan lokasi dari IP tanpa menggunakan proxy
export const getLocationFromIP = async () => {
  // Daftar API geolokasi IP alternatif - urutan berdasarkan reliabilitas
  const ipApis = [
    {
      url: 'https://ipapi.co/json/',
      parser: (data) => ({
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city,
        country: data.country_name,
        timezone: data.timezone
      })
    },
    {
      url: 'https://ipinfo.io/json',
      parser: (data) => {
        const coords = data.loc ? data.loc.split(',') : [null, null];
        return {
          latitude: coords[0],
          longitude: coords[1],
          city: data.city,
          country: data.country,
          timezone: data.timezone
        };
      }
    },
    {
      url: 'https://ipwhois.app/json/',
      parser: (data) => ({
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city,
        country: data.country,
        timezone: data.timezone
      })
    },
    {
      url: 'https://ipwho.is/',
      parser: (data) => ({
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city,
        country: data.country,
        timezone: data.timezone?.id || data.timezone
      })
    },
    {
      url: 'https://freegeoip.app/json/',
      parser: (data) => ({
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city,
        country: data.country_name,
        timezone: data.time_zone
      })
    },
    {
      url: 'https://api.ip2location.com/v2/?format=json',
      parser: (data) => ({
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city_name,
        country: data.country_name,
        timezone: data.time_zone
      })
    }
  ];
  
  console.log(`🔄 Mencoba ${ipApis.length} API IP geolocation...`);
  
  for (let i = 0; i < ipApis.length; i++) {
    const api = ipApis[i];
    try {
      console.log(`📡 Mencoba API ${i+1}: ${api.url}`);
      
      const response = await fetch(api.url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': PRODUCTION_CONFIG.userAgent
        },
        timeout: 5000, // 5 detik timeout per API
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        console.warn(`❌ API ${i+1} status: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      console.log(`📊 API ${i+1} response:`, data);
      
      // Parse data sesuai format API
      const parsed = api.parser(data);
      
      // Validasi data yang diperlukan
      if (parsed.latitude && parsed.longitude) {
        console.log(`✅ API ${i+1} berhasil:`, parsed);
        return {
          latitude: parseFloat(parsed.latitude),
          longitude: parseFloat(parsed.longitude),
          city: parsed.city || 'Unknown City',
          country: parsed.country || 'Unknown Country',
          timezone: parsed.timezone
        };
      } else {
        console.warn(`⚠️ API ${i+1} data tidak lengkap:`, parsed);
      }
    } catch (error) {
      console.warn(`❌ API ${i+1} error:`, error.message);
      // Lanjutkan ke API berikutnya
    }
  }
  
  console.error('🚨 Semua IP geolocation API gagal');
  return null;
};

