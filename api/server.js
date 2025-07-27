const jsonServer = require('json-server');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, '../db.json'));
const middlewares = jsonServer.defaults({
  // Konfigurasi khusus untuk mobile compatibility
  noCors: false,
  logger: true
});

// CORS Configuration untuk mobile
server.use((req, res, next) => {
  // Set CORS headers yang lebih permissive untuk mobile
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  res.header('Access-Control-Allow-Credentials', 'false');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Request logging untuk debugging
server.use((req, res, next) => {
  const userAgent = req.get('User-Agent') || 'Unknown';
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log(`Device: ${isMobile ? 'Mobile' : 'Desktop'}`);
  console.log(`User-Agent: ${userAgent}`);
  
  next();
});

// Error handling middleware
server.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

server.use(middlewares);
server.use('/api', router); // Prefix semua routes dengan /api

// Health check endpoint
server.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent')
  });
});

module.exports = server;
