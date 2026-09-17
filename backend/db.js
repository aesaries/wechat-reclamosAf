// backend/db.js
const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

// Ruta de la base de datos (relativa a la raíz del proyecto)
const dbPath = path.resolve(__dirname, '..', process.env.DB_PATH || './database/reclamos.sqlite');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL'); // mejora el rendimiento

// Creamos las tablas si no existen
db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telefono TEXT UNIQUE NOT NULL,
    nombre TEXT,
    direccion TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
  );

    CREATE TABLE IF NOT EXISTS sesiones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT UNIQUE NOT NULL,
    usuario_id INTEGER NOT NULL,
    activa INTEGER DEFAULT 1,
    expira_en DATETIME NOT NULL,
    estado_conversacion TEXT DEFAULT 'inicio',
    datos_temporales TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
  );

  CREATE TABLE IF NOT EXISTS reclamos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    sesion_id INTEGER,
    tipo TEXT NOT NULL,
    subtipo TEXT,
    detalle_json TEXT,
    estado TEXT DEFAULT 'pendiente',
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (sesion_id) REFERENCES sesiones(id)
  );

  CREATE TABLE IF NOT EXISTS mensajes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reclamo_id INTEGER,
    sesion_id INTEGER,
    remitente TEXT NOT NULL,
    contenido TEXT NOT NULL,
    tipo TEXT DEFAULT 'texto',
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reclamo_id) REFERENCES reclamos(id),
    FOREIGN KEY (sesion_id) REFERENCES sesiones(id)
  );
`);

console.log('✅ Base de datos lista en:', dbPath);

module.exports = db;