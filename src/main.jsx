import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './components/theme-provider.jsx'
import { Toaster } from './components/ui/toaster.jsx'

// Mengatur dark mode sebagai default
if (!localStorage.getItem('vite-ui-theme')) {
  localStorage.setItem('vite-ui-theme', 'dark')
  document.documentElement.classList.remove('light')
  document.documentElement.classList.add('dark')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="waktu-solat-theme">
      <App />
      <Toaster />
    </ThemeProvider>
  </React.StrictMode>,
)
