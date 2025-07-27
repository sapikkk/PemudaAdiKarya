// Mengimpor library yang diperlukan
const jsonServer = require('json-server');
const path = require('path');

// Membuat instance server dari json-server
const server = jsonServer.create();

// Mengarahkan router ke file database db.json Anda.
const router = jsonServer.router(path.join(__dirname, '../db.json'));

// Menggunakan middleware default dari json-server
const middlewares = jsonServer.defaults({
  // Konfigurasi CORS untuk mobile compatibility
  noCors: false
});

// Custom CORS middleware untuk mengatasi masalah mobile
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Menerapkan middleware ke server
server.use(middlewares);

// Middleware untuk logging (debugging)
server.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Menerapkan router ke server
server.use(router);

// Error handling
server.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Mengekspor instance server agar bisa diimpor dan digunakan oleh Vercel
module.exports = server;
