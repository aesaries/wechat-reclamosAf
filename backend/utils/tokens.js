// backend/utils/tokens.js
const crypto = require('crypto');

/**
 * Genera un token único, seguro y aleatorio.
 * @returns {string} token de 64 caracteres hexadecimales
 */
function generarToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Calcula la fecha de expiración de una sesión.
 * @param {number} horas - horas de validez
 * @returns {string} fecha en formato ISO
 */
function calcularExpiracion(horas = 24) {
  const fecha = new Date();
  fecha.setHours(fecha.getHours() + horas);
  return fecha.toISOString();
}

module.exports = { generarToken, calcularExpiracion };