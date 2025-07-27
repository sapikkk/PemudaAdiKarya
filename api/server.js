// api/server.js - Vercel Compatible
const jsonServer = require('json-server');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, '../db.json'));
const middlewares = jsonServer.defaults({
  // Aktifkan CORS untuk semua origin
  cors: true,
  // Nonaktifkan static serving jika tidak diperlukan
  static: false
});

// Custom CORS middleware untuk mobile compatibility
server.use((req, res, next) => {
  // Set CORS headers untuk mobile browser
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware untuk mobile user agent detection dan optimization
server.use((req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  if (isMobile) {
    // Set cache headers untuk mobile
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
  }
  
  next();
});

// Health check endpoint
server.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware default
server.use(middlewares);

// Custom middleware untuk handling JSON dengan error catching
server.use(jsonServer.bodyParser);

// Error handling middleware
server.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// Router dengan prefix /api
server.use('/api', router);

// Fallback untuk root path
server.get('/', (req, res) => {
  res.json({ 
    message: 'JSON Server is running',
    endpoints: {
      health: '/api/health',
      data: '/api/*'
    }
  });
});

module.exports = server;
