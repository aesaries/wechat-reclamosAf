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
      estado_conversacion: sesion.estado_conversacion,
      datos_temporales: sesion.datos_temporales,
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

/**
 * POST /api/sesiones/:token/avanzar
 * Body: { estado, datos? }
 * Actualiza el estado de conversación y agrega datos temporales.
 */
router.post('/:token/avanzar', (req, res) => {
  const { token } = req.params;
  const { estado, datos } = req.body;

  if (!estado) {
    return res.status(400).json({ ok: false, error: 'Falta el estado' });
  }

  const ahora = new Date().toISOString();
  const sesion = db.prepare(`
    SELECT * FROM sesiones
    WHERE token = ? AND activa = 1 AND expira_en > ?
  `).get(token, ahora);

  if (!sesion) {
    return res.status(404).json({ ok: false, error: 'Sesión inválida o expirada' });
  }

  // Fusionamos los datos nuevos con los temporales existentes
  let temporales = {};
  if (sesion.datos_temporales) {
    try { temporales = JSON.parse(sesion.datos_temporales); } catch (e) { temporales = {}; }
  }
  if (datos && typeof datos === 'object') {
    if (Object.keys(datos).length === 0 && Object.keys(temporales).length > 0) {
      // Si mandaron un objeto vacío y había datos, limpiamos todo
      temporales = {};
    } else {
      temporales = { ...temporales, ...datos };
    }
  } 

  db.prepare(`
    UPDATE sesiones
    SET estado_conversacion = ?,
        datos_temporales = ?
    WHERE id = ?
  `).run(estado, JSON.stringify(temporales), sesion.id);

  res.json({ ok: true, estado, datos_temporales: temporales });
});

/**
 * POST /api/sesiones/:token/finalizar
 * Crea el reclamo con los datos temporales y cierra el flujo.
 */
router.post('/:token/finalizar', (req, res) => {
  const { token } = req.params;
  const ahora = new Date().toISOString();

  const sesion = db.prepare(`
    SELECT * FROM sesiones
    WHERE token = ? AND activa = 1 AND expira_en > ?
  `).get(token, ahora);

  if (!sesion) {
    return res.status(404).json({ ok: false, error: 'Sesión inválida o expirada' });
  }

  // Parseamos los datos temporales
  let datos = {};
  if (sesion.datos_temporales) {
    try { datos = JSON.parse(sesion.datos_temporales); } catch (e) { datos = {}; }
  }

  // Validamos lo mínimo indispensable
  if (!datos.tipo || !datos.direccion || !datos.nombre) {
    return res.status(400).json({
      ok: false,
      error: 'Faltan datos obligatorios para crear el reclamo',
      datos,
    });
  }

  // Actualizamos los datos del usuario
  db.prepare(`
    UPDATE usuarios
    SET direccion = COALESCE(?, direccion),
        nombre = COALESCE(?, nombre)
    WHERE id = ?
  `).run(datos.direccion, datos.nombre, sesion.usuario_id);

  // Creamos el reclamo
  const detalleJson = JSON.stringify({
    fotos: datos.fotos || [],
    comentarios: datos.comentarios || null,
  });

  const info = db.prepare(`
    INSERT INTO reclamos (usuario_id, sesion_id, tipo, subtipo, detalle_json)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    sesion.usuario_id,
    sesion.id,
    datos.tipo,
    datos.subtipo || null,
    detalleJson
  );

  // Actualizamos la sesión: estado finalizado, limpiamos temporales
  db.prepare(`
    UPDATE sesiones
    SET estado_conversacion = 'finalizado',
        datos_temporales = NULL
    WHERE id = ?
  `).run(sesion.id);

  const reclamo = db.prepare('SELECT * FROM reclamos WHERE id = ?').get(info.lastInsertRowid);

  res.json({ ok: true, reclamo });
});



module.exports = router;