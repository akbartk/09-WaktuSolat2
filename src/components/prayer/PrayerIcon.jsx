import React from 'react'

/**
 * Production-ready Prayer Icon Component
 * Consolidated icon rendering untuk setiap waktu sholat
 * Menghilangkan code duplication dan meningkatkan maintainability
 */

const PrayerIcon = ({ prayerType, className = "w-5 h-5 mr-2 flex items-center justify-center" }) => {
  const getIconConfig = (type) => {
    const configs = {
      subuh: {
        color: "text-blue-500",
        icon: (
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
        ),
        title: "Subuh - Fajar"
      },
      dzuhur: {
        color: "text-yellow-500",
        icon: (
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
        ),
        title: "Dzuhur - Tengah Hari"
      },
      ashar: {
        color: "text-orange-500",
        icon: (
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
        ),
        title: "Ashar - Sore"
      },
      maghrib: {
        color: "text-red-500",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0-6 9h12a6 6 0 0 0-6-9Z"/>
            <path d="M6 12h12"/>
            <path d="M6 16h12"/>
            <path d="M6 20h12"/>
          </svg>
        ),
        title: "Maghrib - Senja"
      },
      isya: {
        color: "text-indigo-500",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
          </svg>
        ),
        title: "Isya - Malam"
      }
    }
    
    return configs[type] || configs.subuh // fallback ke subuh jika type tidak dikenali
  }

  const { color, icon, title } = getIconConfig(prayerType)

  return (
    <span 
      className={`${className} ${color}`}
      title={title}
      aria-label={title}
    >
      {icon}
    </span>
  )
}

export default PrayerIcon