// Vercel serverless function tanpa json-server
const path = require('path');
const fs = require('fs');

// Database default
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

// Fungsi untuk membaca data
function readDatabase() {
    try {
        const dbPath = path.join(__dirname, '../db.json');
        if (fs.existsSync(dbPath)) {
            const data = fs.readFileSync(dbPath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.log('Using default database');
    }
    return defaultDb;
}

// Fungsi untuk menulis data (optional, karena Vercel serverless)
function writeDatabase(data) {
    try {
        const dbPath = path.join(__dirname, '../db.json');
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing database:', error);
        return false;
    }
}

// Main handler function
module.exports = (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Log request
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

    const db = readDatabase();
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    const searchParams = url.searchParams;

    try {
        // Health check
        if (pathname === '/health') {
            res.status(200).json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                message: 'API is running'
            });
            return;
        }

        // Users endpoints
        if (pathname === '/users' || pathname === '/api/users') {
            if (req.method === 'GET') {
                let users = db.users || [];

                // Filter by email if provided
                const email = searchParams.get('email');
                if (email) {
                    users = users.filter(user => user.email === email);
                }

                res.status(200).json(users);
                return;
            }

            if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });

                req.on('end', () => {
                    try {
                        const newUser = JSON.parse(body);

                        // Validate required fields
                        if (!newUser.name || !newUser.email || !newUser.password) {
                            res.status(400).json({
                                error: 'Missing required fields: name, email, password'
                            });
                            return;
                        }

                        // Check if email already exists
                        const existingUser = db.users.find(user => user.email === newUser.email);
                        if (existingUser) {
                            res.status(409).json({
                                error: 'Email already exists'
                            });
                            return;
                        }

                        // Add new user
                        const user = {
                            id: Math.max(...db.users.map(u => u.id), 0) + 1,
                            ...newUser,
                            role: newUser.role || 'user'
                        };

                        db.users.push(user);
                        writeDatabase(db);

                        res.status(201).json(user);
                        return;
                    } catch (error) {
                        res.status(400).json({
                            error: 'Invalid JSON'
                        });
                        return;
                    }
                });
                return;
            }
        }

        // 404 for unhandled routes
        res.status(404).json({
            error: 'Route not found',
            path: pathname,
            method: req.method
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};