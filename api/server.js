// Mengimpor library yang diperlukan
const jsonServer = require('json-server');
const path = require('path');

// Membuat instance server dari json-server
const server = jsonServer.create();

// Mengarahkan router ke file database db.json
const router = jsonServer.router(path.join(__dirname, '../db.json'));

// Menggunakan middleware default dari json-server
const middlewares = jsonServer.defaults({
    // PERBAIKAN: Konfigurasi CORS untuk mobile
    static: './public',
    noCors: false
});

// PERBAIKAN: Custom CORS middleware untuk mobile compatibility
server.use((req, res, next) => {
    // Izinkan semua origin untuk development
    // Untuk production, ganti '*' dengan domain spesifik Anda
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// PERBAIKAN: Logging middleware untuk debugging mobile issues
server.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('User-Agent:', req.get('User-Agent'));
    next();
});

// Menerapkan middleware ke server
server.use(middlewares);

// PERBAIKAN: Custom routes untuk better error handling
server.use(jsonServer.bodyParser);

// Custom middleware untuk menangani errors
server.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
    });
});

// Menerapkan router ke server
server.use(router);

// PERBAIKAN: Error handling untuk mobile
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Mengekspor instance server agar bisa diimpor dan digunakan oleh Vercel
module.exports = server;
