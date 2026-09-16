// backend/rutas/sesiones.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { generarToken, calcularExpiracion } = require('../utils/tokens');

const HORAS_VALIDEZ = 24;

/**
 * POST /api/sesiones/desde-whatsapp
 * Body: { telefono: "5491122334455" }
 * Devuelve el token de la sesión activa (o crea una nueva si no hay).
 */
router.post('/desde-whatsapp', (req, res) => {
  const { telefono } = req.body;

  if (!telefono) {
    return res.status(400).json({ error: 'Falta el teléfono' });
  }

  // 1. Buscamos o creamos el usuario
  let usuario = db.prepare('SELECT * FROM usuarios WHERE telefono = ?').get(telefono);
  if (!usuario) {
    const info = db.prepare('INSERT INTO usuarios (telefono) VALUES (?)').run(telefono);
    usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(info.lastInsertRowid);
  }

  // 2. Buscamos una sesión activa que no haya expirado
  const ahora = new Date().toISOString();
  let sesion = db.prepare(`
    SELECT * FROM sesiones
    WHERE usuario_id = ? AND activa = 1 AND expira_en > ?
    ORDER BY creado_en DESC LIMIT 1
  `).get(usuario.id, ahora);

  // 3. Si no hay sesión activa, creamos una nueva
  if (!sesion) {
    const token = generarToken();
    const expira = calcularExpiracion(HORAS_VALIDEZ);
    const info = db.prepare(`
      INSERT INTO sesiones (token, usuario_id, expira_en) VALUES (?, ?, ?)
    `).run(token, usuario.id, expira);
    sesion = db.prepare('SELECT * FROM sesiones WHERE id = ?').get(info.lastInsertRowid);
  }

  // 4. Devolvemos los datos al bot
  const baseUrl = process.env.WEBCHAT_URL || 'http://localhost:3000';
  res.json({
    ok: true,
    usuario_id: usuario.id,
    token: sesion.token,
    url_webchat: `${baseUrl}/chat.html?token=${sesion.token}`,
  });
});

/**
 * GET /api/sesiones/validar/:token
 * Valida que un token exista, esté activo y no haya expirado.
 */
router.get('/validar/:token', (req, res) => {
  const { token } = req.params;
  const ahora = new Date().toISOString();

  const sesion = db.prepare(`
    SELECT s.*, u.telefono, u.nombre
    FROM sesiones s
    JOIN usuarios u ON u.id = s.usuario_id
    WHERE s.token = ? AND s.activa = 1 AND s.expira_en > ?
  `).get(token, ahora);

  if (!sesion) {
    return res.status(404).json({ ok: false, error: 'Token inválido o expirado' });
  }

  res.json({ ok: true, sesion });
});

module.exports = router;