// Proxy API untuk mengatasi masalah CORS
const PROXY_URL = 'https://corsproxy.io/?';

// Fungsi untuk mengambil data dari API dengan proxy CORS
export const fetchWithProxy = async (url) => {
  try {
    const proxyUrl = `${PROXY_URL}${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching data with proxy:', error);
    throw error;
  }
};

// Fungsi untuk mengambil data dari API tanpa proxy (untuk fallback)
export const fetchDirect = async (url) => {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching data directly:', error);
    throw error;
  }
};

// Fungsi untuk mencoba beberapa metode fetch secara berurutan
export const fetchWithFallback = async (url) => {
  try {
    // Coba dengan proxy CORS terlebih dahulu
    return await fetchWithProxy(url);
  } catch (error) {
    console.warn('Proxy fetch failed, trying direct fetch:', error);
    
    try {
      // Jika gagal, coba langsung tanpa proxy
      return await fetchDirect(url);
    } catch (directError) {
      console.error('All fetch methods failed:', directError);
      throw directError;
    }
  }
};
