// File untuk mengatasi masalah CORS dengan menggunakan proxy publik

// Daftar proxy CORS yang tersedia
const proxyList = [
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://cors-anywhere.herokuapp.com/${url}`,
  (url) => `https://cors.bridged.cc/${url}`,
  (url) => `https://crossorigin.me/${url}`,
];

// Fungsi untuk mencoba beberapa proxy secara berurutan
export const corsProxy = async (url) => {
  // Coba langsung tanpa proxy terlebih dahulu
  try {
    const directResponse = await fetch(url, { mode: 'cors' });
    if (directResponse.ok) {
      return url;
    }
  } catch (error) {
    console.warn('Direct request failed, trying proxies:', error);
  }

  // Gunakan proxy pertama sebagai default
  return proxyList[0](url);
};

// Fungsi helper untuk mencoba beberapa URL secara berurutan
export const fetchWithFallback = async (url) => {
  const proxiedUrl = await corsProxy(url);
  try {
    const response = await fetch(proxiedUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching with proxy:', error);
    throw error;
  }
};
