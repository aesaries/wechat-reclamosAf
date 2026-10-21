// bot/handlers/compartido/recordatorios.js

// Configuración
const RECORDATORIO_FOTOS_MS = 30 * 1000; // 30 segundos
const RECORDATORIO_OBLIGATORIO_MS = 60 * 1000; // 60 segundos

// Mapa de timers activos, uno por sesión (token)
const timersActivos = new Map();

/**
 * Cancela el recordatorio pendiente de una sesión (si existe).
 */
function cancelarRecordatorio(token) {
  if (timersActivos.has(token)) {
    clearTimeout(timersActivos.get(token));
    timersActivos.delete(token);
  }
}

/**
 * Programa un recordatorio genérico.
 * @param {object} sock - El socket de Baileys
 * @param {string} jid - El jid al que mandar el mensaje
 * @param {string} token - El token de la sesión
 * @param {string} mensaje - El texto a enviar
 * @param {number} ms - Tiempo en milisegundos
 */
function programarRecordatorio(sock, jid, token, mensaje, ms) {
  cancelarRecordatorio(token);

  const timer = setTimeout(async () => {
    try {
      await sock.sendMessage(jid, { text: mensaje });
      console.log(`⏰ Recordatorio enviado a ${token.slice(0, 8)}...`);
    } catch (err) {
      console.error("❌ Error enviando recordatorio:", err);
    }
    timersActivos.delete(token);
  }, ms);

  timersActivos.set(token, timer);
}

/**
 * Programa el recordatorio de fotos (30 seg).
 * Se usa cuando el usuario ya mandó al menos una foto y no escribe.
 */
function programarRecordatorioFotos(sock, jid, token) {
  programarRecordatorio(
    sock,
    jid,
    token,
    '¿Terminaste? Escribí "listo" para continuar o "saltar" para finalizar sin más fotos.',
    RECORDATORIO_FOTOS_MS,
  );
}

/**
 * Programa el recordatorio de campo obligatorio (60 seg).
 * Se usa cuando el usuario está trabado en el paso de foto o ubicación.
 *
 * @param {string} campo - "foto" o "ubicación"
 */
function programarRecordatorioObligatorio(sock, jid, token, campo) {
  const mensaje = `¿Necesitás ayuda? Si no podés mandar ${campo}, escribí "no puedo" y seguimos.`;
  programarRecordatorio(sock, jid, token, mensaje, RECORDATORIO_OBLIGATORIO_MS);
}

module.exports = {
  RECORDATORIO_FOTOS_MS,
  RECORDATORIO_OBLIGATORIO_MS,
  cancelarRecordatorio,
  programarRecordatorio,
  programarRecordatorioFotos,
  programarRecordatorioObligatorio,
};
