// server.js - Proxy server sederhana untuk mengatasi masalah CORS
import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Inisialisasi dotenv
dotenv.config();

// Mendapatkan __dirname dalam ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.API_PORT || 3005;

// Mengaktifkan CORS untuk semua permintaan
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware untuk logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Proxy untuk AlAdhan API
app.use('/api/aladhan', createProxyMiddleware({
  target: 'https://api.aladhan.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/aladhan': ''
  },
  onProxyRes: function(proxyRes, req, res) {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
  }
}));

// Proxy untuk IP Geolocation API
app.use('/api/ipapi', createProxyMiddleware({
  target: 'https://ipapi.co',
  changeOrigin: true,
  pathRewrite: {
    '^/api/ipapi': ''
  },
  onProxyRes: function(proxyRes, req, res) {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
  }
}));

// Proxy untuk MyQuran API
app.use('/api/myquran', createProxyMiddleware({
  target: 'https://api.myquran.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/myquran': ''
  },
  onProxyRes: function(proxyRes, req, res) {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
  }
}));

// Serve static files dari direktori build
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback route untuk SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Mulai server
app.listen(PORT, () => {
  console.log(`Proxy server berjalan di port ${PORT}`);
});
