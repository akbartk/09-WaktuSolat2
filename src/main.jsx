import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './components/theme-provider.jsx'
import { Toaster } from './components/ui/toaster.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="waktu-solat-theme">
      <App />
      <Toaster />
    </ThemeProvider>
  </React.StrictMode>,
)
