const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, World! This is a test deployment on Render.');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Conexión a la base de datos SQLite
let db = new sqlite3.Database('./analytics.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
    }
});

// API de prueba para consultar la base de datos
app.get('/api/test', (req, res) => {
    db.serialize(() => {
        db.each(`SELECT COUNT(*) AS count FROM sqlite_master WHERE type='table'`, (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ tables: row.count });
            }
        });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
