// Mengimpor library yang diperlukan
const jsonServer = require('json-server');
const path = require('path');

// Membuat instance server dari json-server
const server = jsonServer.create();

// Mengarahkan router ke file database db.json Anda.
// path.join(__dirname, '../db.json') secara dinamis membuat path yang benar.
// __dirname adalah direktori tempat file ini (server.js) berada, yaitu '/api'.
// '../db.json' berarti "naik satu level direktori, lalu cari db.json".
const router = jsonServer.router(path.join(__dirname, '../db.json'));

// Menggunakan middleware default dari json-server (seperti logger, cors, dll.)
const middlewares = jsonServer.defaults();

// Menerapkan middleware ke server
server.use(middlewares);

// Menerapkan router ke server. Semua request akan ditangani oleh router ini.
server.use(router);

// Mengekspor instance server agar bisa diimpor dan digunakan oleh Vercel.
// Vercel akan mengambil modul ini dan menjalankannya sebagai serverless function.
module.exports = server;
