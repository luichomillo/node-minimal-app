const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const admin = require("firebase-admin");

// *** PRUEBA DE BASE DE DATOS MYSQL ***
const mysql = require('mysql');

const mysqlConnection = mysql.createConnection({
    host: 'sql10.freesqldatabase.com',
    user: 'sql10741803',
    password: 'Kth7BbalP2',
    database: 'sql10741803',
    port: 3306,
    connectTimeout: 10000 // Timeout de conexión de 10 segundos
});

mysqlConnection.connect((err) => {
    if (err) {
        console.error('Error al conectar con MySQL:', err.message);
        return;
    }
    console.log('Conexión a MySQL establecida');
});

// Conexión a la base de datos antigua
const oldDbConnection = mysql.createConnection({
    host: 'sql10.freesqldatabase.com',
    user: 'sql10741803',
    password: 'Kth7BbalP2',
    database: 'sql10741803',
    port: 3306,
    connectTimeout: 10000 // Timeout de conexión de 10 segundos
});

// Conexión a la base de datos nueva
const newDbConnection = mysql.createConnection({
  host: 'sql312.infinityfree.com',
  user: 'if0_37279537',
  password: 'xIgnfz9vvM ',
  database: 'if0_37279537_luichomillo',
  port: 3306,
  connectTimeout: 10000 // Timeout de conexión de 10 segundos
});

// Nueva API para ejecutar la transferencia de datos
app.post('/api/transferir-datos', (req, res) => {
  // Conectar a la base de datos antigua
  oldDbConnection.connect(err => {
    if (err) {
      console.error('Error al conectar a la base de datos antigua:', err);
      return res.status(500).send('Error al conectar a la base de datos antigua.');
    }

    // Obtener los nombres y tipos de campos
    oldDbConnection.query('SHOW COLUMNS FROM Usuarios', (error, columns) => {
      if (error) {
        console.error('Error al obtener columnas:', error);
        return res.status(500).send('Error al obtener columnas de la tabla.');
      }

      // Construir el SQL para crear la tabla en la nueva base de datos
      let createTableQuery = 'CREATE TABLE IF NOT EXISTS Usuarios (';
      columns.forEach((column, index) => {
        createTableQuery += `${column.Field} ${column.Type}`;
        if (column.Null === 'NO') createTableQuery += ' NOT NULL';
        if (column.Default !== null) createTableQuery += ` DEFAULT '${column.Default}'`;
        if (index < columns.length - 1) createTableQuery += ', ';
      });
      createTableQuery += ')';

      // Conectar a la nueva base de datos y crear la tabla
      newDbConnection.connect(err => {
        if (err) {
          console.error('Error al conectar a la nueva base de datos:', err);
          return res.status(500).send('Error al conectar a la nueva base de datos.');
        }

        newDbConnection.query(createTableQuery, (error) => {
          if (error) {
            console.error('Error al crear la tabla:', error);
            return res.status(500).send('Error al crear la tabla en la nueva base de datos.');
          }

          // Obtener los datos de la tabla antigua y transferirlos
          oldDbConnection.query('SELECT * FROM Usuarios', (error, results) => {
            if (error) {
              console.error('Error al obtener los datos:', error);
              return res.status(500).send('Error al obtener los datos de la tabla.');
            }

            // Insertar los datos en la nueva base de datos
            results.forEach(row => {
              const insertQuery = 'INSERT INTO Usuarios SET ?';
              newDbConnection.query(insertQuery, row, (error, result) => {
                if (error) {
                  console.error('Error al insertar datos:', error);
                } else {
                  console.log(`Datos insertados: ID ${result.insertId}`);
                }
              });
            });

            // Cerrar las conexiones
            newDbConnection.end();
            oldDbConnection.end();
            res.send('Transferencia de datos completada con éxito.');
          });
        });
      });
    });
  });
});


// ******************************************************************
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Cerrar la conexión de la base de datos al cerrar el servidor
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Cerrando la conexión con la base de datos.');
        process.exit(0);
    });
});
