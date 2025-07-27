// api/server.js - Enhanced version dengan debug mode
const jsonServer = require('json-server');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, '../db.json'));

// Debug mode - set ke false untuk production
const DEBUG_MODE = process.env.NODE_ENV !== 'production';

// Custom middlewares untuk debugging dan mobile compatibility
const middlewares = jsonServer.defaults({
  cors: true,
  static: false,
  logger: DEBUG_MODE
});

// Logging middleware untuk debugging
server.use((req, res, next) => {
  if (DEBUG_MODE) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', req.body);
    console.log('Query:', req.query);
  }
  next();
});

// Enhanced CORS middleware untuk mobile
server.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  
  // Set comprehensive CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Expires');
  res.header('Access-Control-Allow-Credentials', 'false'); // Set false untuk public API
  res.header('Access-Control-Max-Age', '86400'); // 24 hours preflight cache
  
  // Additional headers untuk mobile compatibility
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    if (DEBUG_MODE) {
      console.log('Handling OPTIONS preflight request');
    }
    res.status(200).end();
    return;
  }
  
  next();
});

// Request timeout middleware
server.use((req, res, next) => {
  // Set timeout untuk request (30 detik)
  req.setTimeout(30000, () => {
    if (DEBUG_MODE) {
      console.log('Request timeout for:', req.url);
    }
    res.status(408).json({ error: 'Request timeout' });
  });
  
  res.setTimeout(30000, () => {
    if (DEBUG_MODE) {
      console.log('Response timeout for:', req.url);
    }
    res.status(408).json({ error: 'Response timeout' });
  });
  
  next();
});

// Body parser dengan error handling
server.use((req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
    let rawBody = '';
    
    req.on('data', chunk => {
      rawBody += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        if (rawBody) {
          req.body = JSON.parse(rawBody);
        }
        next();
      } catch (error) {
        if (DEBUG_MODE) {
          console.error('JSON Parse Error:', error);
          console.error('Raw body:', rawBody);
        }
        res.status(400).json({ 
          error: 'Invalid JSON format',
          details: error.message 
        });
      }
    });
    
    req.on('error', (error) => {
      if (DEBUG_MODE) {
        console.error('Request Error:', error);
      }
      res.status(400).json({ 
        error: 'Request processing error',
        details: error.message 
      });
    });
  } else {
    next();
  }
});

// Health check endpoint dengan detailed info
server.get('/api/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    platform: process.platform,
    nodeVersion: process.version,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    isMobile: /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(req.get('User-Agent') || '')
  };
  
  if (DEBUG_MODE) {
    console.log('Health check requested:', health);
  }
  
  res.json(health);
});

// Custom login endpoint dengan enhanced error handling
server.post('/api/auth/login', (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    if (DEBUG_MODE) {
      console.log('Login attempt:', { username, email, hasPassword: !!password });
    }
    
    // Validasi input
    if (!username && !email) {
      return res.status(400).json({
        error: 'Username atau email harus diisi',
        code: 'MISSING_CREDENTIALS'
      });
    }
    
    if (!password) {
      return res.status(400).json({
        error: 'Password harus diisi',
        code: 'MISSING_PASSWORD'
      });
    }
    
    // Simulasi pengecekan user (sesuaikan dengan struktur db.json Anda)
    const db = router.db; // Get database instance
    const users = db.get('users').value() || [];
    
    const user = users.find(u => 
      (u.username === username || u.email === email) && u.password === password
    );
    
    if (!user) {
      if (DEBUG_MODE) {
        console.log('Login failed - user not found or wrong password');
        console.log('Available users:', users.map(u => ({ username: u.username, email: u.email })));
      }
      
      return res.status(401).json({
        error: 'Username/email atau password salah',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Login berhasil
    const response = {
      success: true,
      message: 'Login berhasil',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        // Jangan kirim password
      },
      token: `fake-jwt-token-${user.id}-${Date.now()}`, // Fake token untuk demo
      timestamp: new Date().toISOString()
    };
    
    if (DEBUG_MODE) {
      console.log('Login successful:', response);
    }
    
    res.json(response);
    
  } catch (error) {
    if (DEBUG_MODE) {
      console.error('Login error:', error);
    }
    
    res.status(500).json({
      error: 'Server error during login',
      code: 'SERVER_ERROR',
      details: DEBUG_MODE ? error.message : 'Internal server error'
    });
  }
});

// Test endpoint untuk debugging
server.get('/api/test', (req, res) => {
  res.json({
    message: 'Test endpoint working',
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    timestamp: new Date().toISOString()
  });
});

// Apply default middlewares
server.use(middlewares);

// Error handling middleware
server.use((err, req, res, next) => {
  if (DEBUG_MODE) {
    console.error('Server Error:', err);
    console.error('Stack:', err.stack);
  }
  
  res.status(err.status || 500).json({
    error: 'Server error',
    message: err.message,
    code: err.code || 'SERVER_ERROR',
    details: DEBUG_MODE ? err.stack : undefined
  });
});

// Apply router untuk semua endpoints lainnya
server.use('/api', router);

// Fallback untuk root
server.get('/', (req, res) => {
  res.json({
    message: 'JSON Server API is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      test: '/api/test',
      login: '/api/auth/login',
      data: '/api/*'
    },
    timestamp: new Date().toISOString()
  });
});

// Handle 404
server.use((req, res) => {
  if (DEBUG_MODE) {
    console.log('404 - Route not found:', req.url);
  }
  
  res.status(404).json({
    error: 'Route not found',
    url: req.url,
    method: req.method,
    availableRoutes: ['/api/health', '/api/test', '/api/auth/login', '/api/*']
  });
});

module.exports = server;
