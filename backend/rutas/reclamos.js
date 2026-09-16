// backend/rutas/reclamos.js
const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * POST /api/reclamos
 * Body: { token, tipo, subtipo?, detalle? }
 * Crea un reclamo asociado al usuario de la sesión del token.
 */
router.post('/', (req, res) => {
  const { token, tipo, subtipo, detalle } = req.body;

  if (!token || !tipo) {
    return res.status(400).json({ ok: false, error: 'Faltan datos obligatorios (token, tipo)' });
  }

  // 1. Buscamos la sesión por token
  const ahora = new Date().toISOString();
  const sesion = db.prepare(`
    SELECT * FROM sesiones
    WHERE token = ? AND activa = 1 AND expira_en > ?
  `).get(token, ahora);

  if (!sesion) {
    return res.status(404).json({ ok: false, error: 'Sesión inválida o expirada' });
  }

  // 2. Guardamos el reclamo
  const detalleJson = detalle ? JSON.stringify(detalle) : null;
  const info = db.prepare(`
    INSERT INTO reclamos (usuario_id, sesion_id, tipo, subtipo, detalle_json)
    VALUES (?, ?, ?, ?, ?)
  `).run(sesion.usuario_id, sesion.id, tipo, subtipo || null, detalleJson);

  // 3. Devolvemos el reclamo creado
  const reclamo = db.prepare('SELECT * FROM reclamos WHERE id = ?').get(info.lastInsertRowid);

  res.json({ ok: true, reclamo });
});



/**
 * GET /api/reclamos/sesion/:token
 * Devuelve todos los reclamos del usuario dueño de esa sesión.
 */
router.get('/sesion/:token', (req, res) => {
  const { token } = req.params;
  const ahora = new Date().toISOString();

  // 1. Buscamos la sesión
  const sesion = db.prepare(`
    SELECT * FROM sesiones
    WHERE token = ? AND activa = 1 AND expira_en > ?
  `).get(token, ahora);

  if (!sesion) {
    return res.status(404).json({ ok: false, error: 'Sesión inválida o expirada' });
  }

  // 2. Traemos todos los reclamos de ese usuario, ordenados por más reciente
  const reclamos = db.prepare(`
    SELECT * FROM reclamos
    WHERE usuario_id = ?
    ORDER BY creado_en DESC
  `).all(sesion.usuario_id);

  res.json({ ok: true, reclamos });
});



module.exports = router;