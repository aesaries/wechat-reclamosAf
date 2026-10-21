// bot/handlers/compartido/api.js
require("dotenv").config();

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

/**
 * Hace un POST al backend y devuelve el JSON de respuesta.
 * @param {string} ruta - Ruta relativa (ej: '/api/sesiones/desde-whatsapp')
 * @param {object} body - Cuerpo del request
 * @returns {Promise<object>} Respuesta del backend parseada como JSON
 */
async function apiPost(ruta, body = {}) {
  const resp = await fetch(`${BACKEND_URL}${ruta}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return resp.json();
}

/**
 * Hace un GET al backend y devuelve el JSON de respuesta.
 * @param {string} ruta - Ruta relativa (ej: '/api/reclamos/sesion/abc123')
 * @returns {Promise<object>} Respuesta del backend parseada como JSON
 */
async function apiGet(ruta) {
  const resp = await fetch(`${BACKEND_URL}${ruta}`);
  return resp.json();
}

module.exports = { apiPost, apiGet, BACKEND_URL };
