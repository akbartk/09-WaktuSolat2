/**
 * Internationalization (i18n) System untuk Global Prayer Times
 * Mengikuti browser language dengan fallback ke English
 */

// Language translations
export const translations = {
  // English (default/fallback)
  'en': {
    // App Title & Meta
    appTitle: "Global Prayer Times",
    appDescription: "Worldwide Islamic Prayer Schedule",
    metaDescription: "Global Prayer Times - Accurate prayer schedule worldwide with automatic location detection",
    
    // Splash Screen
    splashTitle: "Global Prayer Times",
    splashSubtitle: "Loading prayer schedule for your location...",
    loadingText: "Loading...",
    
    // Main Interface
    cardTitle: "Global Prayer Times",
    refreshButton: "Refresh",
    
    // Prayer Times
    fajr: "Fajr",
    sunrise: "Sunrise", 
    dhuhr: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
    
    // Countdown
    nextPrayer: "in",
    hours: "hours",
    minutes: "minutes",
    seconds: "seconds",
    
    // Location
    detectingLocation: "Detecting location...",
    locationPermission: "Please allow location access for accurate results",
    locationFound: "Location found",
    locationNotFound: "Location not found",
    usingGPS: "Using GPS location",
    usingIP: "Using IP-based location", 
    usingDefault: "Using default location",
    
    // Footer
    copyright: "Global Prayer Times © 2025",
    usingMethod: "Using",
    method: "Method",
    
    // Days
    monday: "Monday",
    tuesday: "Tuesday", 
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
    
    // Months
    january: "January",
    february: "February",
    march: "March",
    april: "April",
    may: "May",
    june: "June",
    july: "July",
    august: "August",
    september: "September",
    october: "October",
    november: "November",
    december: "December",
    
    // Error Messages
    errorLoading: "Failed to load prayer times",
    errorTryAgain: "Please try again later",
    errorGeolocation: "Geolocation not supported",
    errorNetwork: "Network error occurred",
    
    // Theme
    darkMode: "Dark Mode",
    lightMode: "Light Mode", 
    activated: "activated",
    displayUpdated: "Display updated"
  },
  
  // Bahasa Indonesia
  'id': {
    appTitle: "Waktu Solat Global",
    appDescription: "Jadwal Sholat Islam Sedunia", 
    metaDescription: "Waktu Solat Global - Jadwal sholat akurat sedunia dengan deteksi lokasi otomatis",
    
    splashTitle: "Waktu Solat Global",
    splashSubtitle: "Memuat jadwal sholat untuk lokasi Anda...",
    loadingText: "Memuat...",
    
    cardTitle: "Waktu Solat Global",
    refreshButton: "Refresh",
    
    fajr: "Subuh",
    sunrise: "Syuruq",
    dhuhr: "Dzuhur", 
    asr: "Ashar",
    maghrib: "Maghrib",
    isha: "Isya",
    
    nextPrayer: "dalam",
    hours: "jam",
    minutes: "menit", 
    seconds: "detik",
    
    detectingLocation: "Mendeteksi lokasi...",
    locationPermission: "Silakan izinkan akses lokasi untuk hasil yang akurat",
    locationFound: "Lokasi ditemukan",
    locationNotFound: "Lokasi tidak ditemukan", 
    usingGPS: "Menggunakan lokasi GPS",
    usingIP: "Menggunakan lokasi berdasarkan IP",
    usingDefault: "Menggunakan lokasi default",
    
    copyright: "Waktu Solat Global © 2025",
    usingMethod: "Menggunakan",
    method: "Metode",
    
    monday: "Senin",
    tuesday: "Selasa",
    wednesday: "Rabu", 
    thursday: "Kamis",
    friday: "Jumat",
    saturday: "Sabtu",
    sunday: "Minggu",
    
    january: "Januari",
    february: "Februari",
    march: "Maret",
    april: "April", 
    may: "Mei",
    june: "Juni",
    july: "Juli",
    august: "Agustus",
    september: "September",
    october: "Oktober", 
    november: "November",
    december: "Desember",
    
    errorLoading: "Gagal memuat jadwal sholat",
    errorTryAgain: "Silakan coba lagi nanti", 
    errorGeolocation: "Geolocation tidak didukung",
    errorNetwork: "Terjadi kesalahan jaringan",
    
    darkMode: "Mode Gelap",
    lightMode: "Mode Terang",
    activated: "diaktifkan", 
    displayUpdated: "Tampilan telah diperbarui"
  },
  
  // Japanese
  'ja': {
    appTitle: "グローバル礼拝時間",
    appDescription: "世界のイスラム礼拝スケジュール",
    metaDescription: "グローバル礼拝時間 - 自動位置検出による世界中の正確な礼拝スケジュール",
    
    splashTitle: "グローバル礼拝時間", 
    splashSubtitle: "あなたの場所の礼拝スケジュールを読み込んでいます...",
    loadingText: "読み込み中...",
    
    cardTitle: "グローバル礼拝時間",
    refreshButton: "更新",
    
    fajr: "ファジュル",
    sunrise: "日の出",
    dhuhr: "ズフル",
    asr: "アスル", 
    maghrib: "マグリブ",
    isha: "イシャー",
    
    nextPrayer: "まで",
    hours: "時間",
    minutes: "分",
    seconds: "秒",
    
    detectingLocation: "位置を検出中...",
    locationPermission: "正確な結果のために位置情報アクセスを許可してください",
    locationFound: "位置が見つかりました",
    locationNotFound: "位置が見つかりません",
    usingGPS: "GPS位置を使用",
    usingIP: "IPベースの位置を使用", 
    usingDefault: "デフォルト位置を使用",
    
    copyright: "グローバル礼拝時間 © 2025",
    usingMethod: "使用中",
    method: "方法",
    
    monday: "月曜日",
    tuesday: "火曜日",
    wednesday: "水曜日",
    thursday: "木曜日",
    friday: "金曜日", 
    saturday: "土曜日",
    sunday: "日曜日",
    
    january: "1月",
    february: "2月", 
    march: "3月",
    april: "4月",
    may: "5月",
    june: "6月",
    july: "7月",
    august: "8月",
    september: "9月",
    october: "10月",
    november: "11月", 
    december: "12月",
    
    errorLoading: "礼拝時間の読み込みに失敗しました",
    errorTryAgain: "後でもう一度お試しください",
    errorGeolocation: "ジオロケーションはサポートされていません", 
    errorNetwork: "ネットワークエラーが発生しました",
    
    darkMode: "ダークモード",
    lightMode: "ライトモード",
    activated: "が有効になりました",
    displayUpdated: "表示が更新されました"
  },
  
  // Arabic
  'ar': {
    appTitle: "مواقيت الصلاة العالمية",
    appDescription: "جدول الصلاة الإسلامي العالمي",
    metaDescription: "مواقيت الصلاة العالمية - جدول صلاة دقيق في جميع أنحاء العالم مع الكشف التلقائي للموقع",
    
    splashTitle: "مواقيت الصلاة العالمية",
    splashSubtitle: "جاري تحميل جدول الصلاة لموقعك...",
    loadingText: "جاري التحميل...",
    
    cardTitle: "مواقيت الصلاة العالمية", 
    refreshButton: "تحديث",
    
    fajr: "الفجر",
    sunrise: "الشروق",
    dhuhr: "الظهر",
    asr: "العصر",
    maghrib: "المغرب",
    isha: "العشاء",
    
    nextPrayer: "خلال",
    hours: "ساعة",
    minutes: "دقيقة", 
    seconds: "ثانية",
    
    detectingLocation: "جاري اكتشاف الموقع...",
    locationPermission: "يرجى السماح بالوصول إلى الموقع للحصول على نتائج دقيقة",
    locationFound: "تم العثور على الموقع",
    locationNotFound: "لم يتم العثور على الموقع",
    usingGPS: "استخدام موقع GPS",
    usingIP: "استخدام الموقع المستند إلى IP",
    usingDefault: "استخدام الموقع الافتراضي",
    
    copyright: "مواقيت الصلاة العالمية © ٢٠٢٥", 
    usingMethod: "باستخدام",
    method: "الطريقة",
    
    monday: "الاثنين",
    tuesday: "الثلاثاء",
    wednesday: "الأربعاء",
    thursday: "الخميس",
    friday: "الجمعة",
    saturday: "السبت",
    sunday: "الأحد",
    
    january: "يناير",
    february: "فبراير",
    march: "مارس", 
    april: "أبريل",
    may: "مايو",
    june: "يونيو",
    july: "يوليو",
    august: "أغسطس",
    september: "سبتمبر",
    october: "أكتوبر",
    november: "نوفمبر",
    december: "ديسمبر",
    
    errorLoading: "فشل في تحميل مواقيت الصلاة",
    errorTryAgain: "يرجى المحاولة مرة أخرى لاحقًا",
    errorGeolocation: "الموقع الجغرافي غير مدعوم",
    errorNetwork: "حدث خطأ في الشبكة",
    
    darkMode: "الوضع المظلم",
    lightMode: "الوضع المضيء",
    activated: "مُفعل",
    displayUpdated: "تم تحديث العرض"
  }
};

/**
 * Get browser language dengan fallback
 */
export const getBrowserLanguage = () => {
  // Cek navigator.language dan navigator.languages
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  
  // Extract language code (contoh: 'id-ID' -> 'id')
  const langCode = browserLang.split('-')[0].toLowerCase();
  
  // Return language code jika ada translation, jika tidak fallback ke 'en'
  return translations[langCode] ? langCode : 'en';
};

/**
 * Get current language dari localStorage atau browser
 */
export const getCurrentLanguage = () => {
  // Cek localStorage dulu untuk user preference
  const savedLang = localStorage.getItem('prayer-times-language');
  if (savedLang && translations[savedLang]) {
    return savedLang;
  }
  
  // Fallback ke browser language
  return getBrowserLanguage();
};

/**
 * Set language preference
 */
export const setLanguage = (langCode) => {
  if (translations[langCode]) {
    localStorage.setItem('prayer-times-language', langCode);
    return true;
  }
  return false;
};

/**
 * Get translation text
 */
export const t = (key, lang = null) => {
  const currentLang = lang || getCurrentLanguage();
  return translations[currentLang]?.[key] || translations['en'][key] || key;
};

/**
 * Get all available languages
 */
export const getAvailableLanguages = () => {
  return Object.keys(translations).map(code => ({
    code,
    name: getLanguageName(code),
    nativeName: getLanguageNativeName(code)
  }));
};

/**
 * Get language name in English
 */
const getLanguageName = (code) => {
  const names = {
    'en': 'English',
    'id': 'Indonesian', 
    'ja': 'Japanese',
    'ar': 'Arabic'
  };
  return names[code] || code;
};

/**
 * Get language name in native language
 */
const getLanguageNativeName = (code) => {
  const nativeNames = {
    'en': 'English',
    'id': 'Bahasa Indonesia',
    'ja': '日本語', 
    'ar': 'العربية'
  };
  return nativeNames[code] || code;
};

/**
 * Check if language is RTL
 */
export const isRTL = (lang = null) => {
  const currentLang = lang || getCurrentLanguage();
  return ['ar', 'he', 'fa', 'ur'].includes(currentLang);
};

/**
 * Format date dengan lokalisasi
 */
export const formatLocalizedDate = (date, lang = null, options = null) => {
  const currentLang = lang || getCurrentLanguage();
  
  // Mapping language codes ke Intl locale
  const localeMap = {
    'en': 'en-US',
    'id': 'id-ID', 
    'ja': 'ja-JP',
    'ar': 'ar-SA'
  };
  
  const locale = localeMap[currentLang] || 'en-US';
  
  const defaultOptions = {
    weekday: 'long',
    day: 'numeric', 
    month: 'long',
    year: 'numeric'
  };
  
  return date.toLocaleDateString(locale, options || defaultOptions);
};

/**
 * Format time dengan lokalisasi
 */
export const formatLocalizedTime = (date, lang = null, options = null) => {
  const currentLang = lang || getCurrentLanguage();
  
  const localeMap = {
    'en': 'en-US',
    'id': 'id-ID',
    'ja': 'ja-JP', 
    'ar': 'ar-SA'
  };
  
  const locale = localeMap[currentLang] || 'en-US';
  
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  
  return date.toLocaleTimeString(locale, options || defaultOptions);
};