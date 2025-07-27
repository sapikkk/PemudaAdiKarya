// Mengimpor library yang diperlukan
const jsonServer = require('json-server');
const path = require('path');
const fs = require('fs');

// Membuat instance server dari json-server
const server = jsonServer.create();

// Path ke database - coba beberapa kemungkinan lokasi
let dbPath;
const possiblePaths = [
  path.join(__dirname, '../db.json'),
  path.join(process.cwd(), 'db.json'),
  path.join(__dirname, 'db.json')
];

// Cari file db.json yang ada
for (const testPath of possiblePaths) {
  if (fs.existsSync(testPath)) {
    dbPath = testPath;
    break;
  }
}

// Jika tidak ditemukan, buat database default
if (!dbPath) {
  dbPath = path.join(__dirname, '../db.json');
  const defaultDb = {
    users: [
      {
        id: 1,
        name: "Admin",
        email: "admin@example.com",
        password: "admin123",
        role: "admin"
      },
      {
        id: 2,
        name: "User Test",
        email: "user@example.com", 
        password: "user123",
        role: "user"
      }
    ]
  };
  
  try {
    fs.writeFileSync(dbPath, JSON.stringify(defaultDb, null, 2));
  } catch (error) {
    console.error('Error creating default db:', error);
  }
}

console.log('Using database at:', dbPath);

// Mengarahkan router ke file database
const router = jsonServer.router(dbPath);

// Menggunakan middleware default dari json-server
const middlewares = jsonServer.defaults({
  noCors: false
});

// Custom CORS middleware
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

// Middleware untuk logging
server.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Menerapkan router ke server dengan prefix untuk API
server.use('/api', router);

// Health check endpoint
server.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    dbPath: dbPath 
  });
});

// Catch all untuk debugging
server.use('*', (req, res) => {
  console.log('Unhandled route:', req.method, req.originalUrl);
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling
server.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Mengekspor instance server
module.exports = server;
