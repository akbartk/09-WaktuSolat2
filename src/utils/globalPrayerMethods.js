/**
 * Global Prayer Calculation Methods
 * Supporting worldwide prayer time calculations based on location
 */

// Prayer calculation methods mapping untuk berbagai negara/region
export const PRAYER_METHODS = {
  // Method 1: University of Islamic Sciences, Karachi
  1: {
    name: "University of Islamic Sciences, Karachi",
    countries: ["PK", "IN", "BD", "AF"],
    regions: ["South Asia"],
    description: "Used in Pakistan, India, Bangladesh, Afghanistan"
  },
  
  // Method 2: Islamic Society of North America (ISNA)  
  2: {
    name: "Islamic Society of North America (ISNA)",
    countries: ["US", "CA"],
    regions: ["North America"],
    description: "Used in USA and Canada"
  },
  
  // Method 3: Muslim World League
  3: {
    name: "Muslim World League",
    countries: ["SA", "AE", "KW", "QA", "BH", "OM"],
    regions: ["Middle East", "Gulf Countries"],
    description: "Used in Saudi Arabia and Gulf countries"
  },
  
  // Method 4: Umm Al-Qura University, Makkah
  4: {
    name: "Umm Al-Qura University, Makkah",
    countries: ["SA"],
    regions: ["Saudi Arabia"],
    description: "Official method for Saudi Arabia"
  },
  
  // Method 5: Egyptian General Authority of Survey
  5: {
    name: "Egyptian General Authority of Survey",
    countries: ["EG", "LY", "SD"],
    regions: ["Egypt", "North Africa"],
    description: "Used in Egypt and some North African countries"
  },
  
  // Method 7: Institute of Geophysics, University of Tehran
  7: {
    name: "Institute of Geophysics, University of Tehran",
    countries: ["IR"],
    regions: ["Iran"],
    description: "Used in Iran"
  },
  
  // Method 8: Gulf Region
  8: {
    name: "Gulf Region",
    countries: ["AE", "KW", "QA", "BH"],
    regions: ["Gulf Region"],
    description: "Used in Gulf region countries"
  },
  
  // Method 9: Kuwait
  9: {
    name: "Kuwait",
    countries: ["KW"],
    regions: ["Kuwait"],
    description: "Used in Kuwait"
  },
  
  // Method 10: Qatar
  10: {
    name: "Qatar",
    countries: ["QA"],
    regions: ["Qatar"],  
    description: "Used in Qatar"
  },
  
  // Method 11: Majlis Ugama Islam Singapura, Singapore
  11: {
    name: "Majlis Ugama Islam Singapura",
    countries: ["SG"],
    regions: ["Singapore"],
    description: "Used in Singapore"
  },
  
  // Method 12: Union Organization islamique de France
  12: {
    name: "Union Organization islamique de France",
    countries: ["FR"],
    regions: ["France"],
    description: "Used in France"
  },
  
  // Method 13: Diyanet İşleri Başkanlığı, Turkey
  13: {
    name: "Diyanet İşleri Başkanlığı",
    countries: ["TR"],
    regions: ["Turkey"],
    description: "Used in Turkey"
  },
  
  // Method 14: Spiritual Administration of Muslims of Russia
  14: {
    name: "Spiritual Administration of Muslims of Russia",
    countries: ["RU"],
    regions: ["Russia"],
    description: "Used in Russia"
  },
  
  // Method 15: Moonsighting Committee Worldwide (also used in some European countries)
  15: {
    name: "Moonsighting Committee Worldwide",
    countries: ["GB", "IE", "NL", "BE", "DE"],
    regions: ["Europe", "UK"],
    description: "Used in UK and some European countries"
  },
  
  // Method 16: Moroccan Ministry of Habous and Islamic Affairs
  16: {
    name: "Moroccan Ministry of Habous and Islamic Affairs",
    countries: ["MA"],
    regions: ["Morocco"],
    description: "Used in Morocco"
  },
  
  // Method 17: Jabatan Kemajuan Islam Malaysia (JAKIM)
  17: {
    name: "Jabatan Kemajuan Islam Malaysia (JAKIM)",
    countries: ["MY"],
    regions: ["Malaysia"],
    description: "Used in Malaysia"
  },
  
  // Method 18: Tunisia
  18: {
    name: "Tunisia",
    countries: ["TN"],
    regions: ["Tunisia"],
    description: "Used in Tunisia"
  },
  
  // Method 19: Algeria
  19: {
    name: "Algeria", 
    countries: ["DZ"],
    regions: ["Algeria"],
    description: "Used in Algeria"
  },
  
  // Method 20: Kementerian Agama Republik Indonesia
  20: {
    name: "Kementerian Agama Republik Indonesia",
    countries: ["ID"],
    regions: ["Indonesia"],
    description: "Used in Indonesia"
  },
  
  // Method 21: Jordan
  21: {
    name: "Jordan",
    countries: ["JO"],
    regions: ["Jordan"],
    description: "Used in Jordan"
  },
  
  // Method 22: Libya
  22: {
    name: "Libya",
    countries: ["LY"],
    regions: ["Libya"],
    description: "Used in Libya"
  },
  
  // Method 23: ISNA (modified for Europe)
  23: {
    name: "ISNA (modified for high latitudes)",
    countries: ["NO", "SE", "FI", "DK", "IS"],
    regions: ["Nordic Countries", "High Latitudes"],
    description: "Used in Nordic countries and high latitude regions"
  }
};

// Regional defaults untuk negara yang tidak ada mapping spesifik
export const REGIONAL_DEFAULTS = {
  // Asia
  "Asia": {
    method: 1, // Karachi
    fallback: [3, 20] // MWL, Indonesia
  },
  
  // Europe  
  "Europe": {
    method: 15, // Moonsighting Committee
    fallback: [2, 12] // ISNA, France
  },
  
  // Africa
  "Africa": {
    method: 5, // Egyptian
    fallback: [3, 16] // MWL, Morocco  
  },
  
  // North America
  "North America": {
    method: 2, // ISNA
    fallback: [3] // MWL
  },
  
  // South America
  "South America": {
    method: 2, // ISNA
    fallback: [3] // MWL
  },
  
  // Oceania
  "Oceania": {
    method: 3, // MWL
    fallback: [2] // ISNA
  },
  
  // Middle East
  "Middle East": {
    method: 3, // MWL
    fallback: [4] // Umm Al-Qura
  }
};

/**
 * Determine calculation method berdasarkan country code dan continent
 */
export const getCalculationMethod = (countryCode, continent) => {
  // First, cari method spesifik untuk country
  for (const [methodId, methodInfo] of Object.entries(PRAYER_METHODS)) {
    if (methodInfo.countries.includes(countryCode)) {
      return {
        method: parseInt(methodId),
        name: methodInfo.name,
        description: methodInfo.description,
        source: "country-specific"
      };
    }
  }
  
  // Jika tidak ada, gunakan regional default
  const regionalDefault = REGIONAL_DEFAULTS[continent];
  if (regionalDefault) {
    const methodInfo = PRAYER_METHODS[regionalDefault.method];
    return {
      method: regionalDefault.method,
      name: methodInfo.name,
      description: `Regional default for ${continent}`,
      source: "regional-default"
    };
  }
  
  // Ultimate fallback: Muslim World League (most widely accepted)
  return {
    method: 3,
    name: PRAYER_METHODS[3].name,
    description: "Global default - most widely accepted",
    source: "global-default"
  };
};

/**
 * Get continent dari coordinates menggunakan rough geographical boundaries
 */
export const getContinentFromCoordinates = (latitude, longitude) => {
  // Simple continent detection berdasarkan coordinates
  // Europe
  if (latitude >= 35 && latitude <= 71 && longitude >= -25 && longitude <= 50) {
    return "Europe";
  }
  
  // Asia  
  if (latitude >= -10 && latitude <= 80 && longitude >= 50 && longitude <= 180) {
    return "Asia";
  }
  
  // Africa
  if (latitude >= -35 && latitude <= 37 && longitude >= -20 && longitude <= 55) {
    return "Africa";
  }
  
  // North America
  if (latitude >= 15 && latitude <= 72 && longitude >= -168 && longitude <= -50) {
    return "North America";
  }
  
  // South America  
  if (latitude >= -56 && latitude <= 15 && longitude >= -82 && longitude <= -35) {
    return "South America";
  }
  
  // Oceania
  if (latitude >= -47 && latitude <= -10 && longitude >= 110 && longitude <= 180) {
    return "Oceania";
  }
  
  // Middle East (more specific than Asia)
  if (latitude >= 12 && latitude <= 42 && longitude >= 25 && longitude <= 65) {
    return "Middle East";
  }
  
  // Default fallback
  return "Asia";
};

/**
 * Format method name untuk display
 */
export const formatMethodDisplay = (methodInfo, countryName) => {
  if (methodInfo.source === "country-specific") {
    return `${methodInfo.name}`;
  } else if (methodInfo.source === "regional-default") {
    return `${methodInfo.name} (Regional)`;
  } else {
    return `${methodInfo.name} (Global)`;
  }
};