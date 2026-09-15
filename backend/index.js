// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importamos la DB para que se inicialice (crea las tablas)
require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de salud, para chequear que el server está vivo
app.get('/api/health', (req, res) => {
  res.json({ ok: true, mensaje: 'Backend funcionando' });
});

// Acá vamos a ir montando las rutas a medida que las creemos
app.use('/api/sesiones', require('./rutas/sesiones'));
// app.use('/api/reclamos', require('./rutas/reclamos'));

app.listen(PORT, () => {
  console.log(`🚀 Backend escuchando en http://localhost:${PORT}`);
});