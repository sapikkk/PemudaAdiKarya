// Mengimpor library yang diperlukan
const jsonServer = require('json-server');
const path = require('path');

// Membuat instance server dari json-server
const server = jsonServer.create();

// PERBAIKAN: Custom middleware untuk CORS yang lebih permisif
server.use((req, res, next) => {
    // Set CORS headers untuk semua request
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// PERBAIKAN: Middleware untuk logging (membantu debugging)
server.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// PERBAIKAN: Middleware untuk error handling
server.use((req, res, next) => {
    try {
        next();
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Mengarahkan router ke file database db.json
// PERBAIKAN: Tambahkan fallback jika file tidak ditemukan
let router;
try {
    const dbPath = path.join(__dirname, '../db.json');
    console.log('Looking for database at:', dbPath);
    router = jsonServer.router(dbPath);
} catch (error) {
    console.error('Error loading database:', error);
    // Fallback: buat router dengan data kosong
    router = jsonServer.router({
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
                name: "User",
                email: "user@example.com", 
                password: "user123",
                role: "user"
            }
        ]
    });
}

// Menggunakan middleware default dari json-server dengan konfigurasi khusus
const middlewares = jsonServer.defaults({
    // PERBAIKAN: Konfigurasi untuk mobile compatibility
    noCors: true, // Kita sudah handle CORS manual di atas
    logger: true,
    static: path.join(__dirname, '../dist'), // Serve static files jika ada
});

// Menerapkan middleware ke server
server.use(middlewares);

// PERBAIKAN: Custom route untuk health check
server.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// PERBAIKAN: Rewrite rules untuk API routes
server.use(jsonServer.rewriter({
    '/api/*': '/$1'
}));

// Menerapkan router ke server
server.use(router);

// PERBAIKAN: Error handler global
server.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(500).json({
        error: 'Something went wrong!',
        message: error.message,
        timestamp: new Date().toISOString()
    });
});

// PERBAIKAN: Handle 404 routes
server.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
    });
});

// Mengekspor instance server untuk Vercel
module.exports = server;
