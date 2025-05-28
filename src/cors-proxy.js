// File untuk mengatasi masalah CORS dengan menggunakan proxy publik

// Daftar proxy CORS yang tersedia
const proxyList = [
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://cors-anywhere.herokuapp.com/${url}`,
  (url) => `https://cors.bridged.cc/${url}`,
  (url) => `https://crossorigin.me/${url}`,
  // Tambahkan proxy baru yang lebih reliabel
  (url) => `https://proxy.cors.sh/${url}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

// Fungsi untuk mencoba beberapa proxy secara berurutan
export const corsProxy = async (url) => {
  // Coba langsung tanpa proxy terlebih dahulu
  try {
    const directResponse = await fetch(url, { 
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'WaktuSolat App (https://akbartk.info)'
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
          'User-Agent': 'WaktuSolat App (https://akbartk.info)'
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
        'User-Agent': 'WaktuSolat App (https://akbartk.info)'
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
  // Daftar API geolokasi IP alternatif
  const ipApis = [
    'https://ipapi.co/json/',
    'https://ipinfo.io/json',
    'https://api.ipify.org/?format=json',
    'https://ipwho.is/'
  ];
  
  for (const api of ipApis) {
    try {
      const response = await fetch(api, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'WaktuSolat App (https://akbartk.info)'
        }
      });
      
      if (!response.ok) continue;
      
      const data = await response.json();
      
      // Format respons agar konsisten
      return {
        latitude: data.latitude || data.loc?.split(',')[0] || null,
        longitude: data.longitude || data.loc?.split(',')[1] || null,
        city: data.city,
        country: data.country || data.country_name,
        timezone: data.timezone
      };
    } catch (error) {
      console.warn(`IP API ${api} failed:`, error.message);
      // Lanjutkan ke API berikutnya
    }
  }
  
  // Jika semua API gagal
  return null;
};

