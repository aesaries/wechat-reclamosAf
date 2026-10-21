// bot/handlers/menu.js
const { apiPost } = require("./compartido/api");

// ============================================================
// TEXTOS
// ============================================================

const TEXTO_BIENVENIDA = `¡Hola! 👋 Soy el asistente virtual de Agrotécnica Fueguina.

¿En qué puedo ayudarte?

1. Hacer un reclamo
2. Consultar horarios o frecuencias
3. Otros casos`;

const TEXTO_PROXIMAMENTE = `Estamos trabajando en esta opción. Por ahora podés elegir otra del menú escribiendo "hola".`;

const TEXTO_OPCION_INVALIDA =
  "No entendí. Elegí una opción escribiendo 1, 2 o 3.";

// ============================================================
// HANDLER DEL MENÚ
// ============================================================

/**
 * Maneja el estado del menú principal.
 * - Si el estado es 'inicio': muestra la bienvenida y pasa a 'esperando_menu'.
 * - Si el estado es 'esperando_menu': procesa la opción elegida.
 *
 * @param {object} sock - El socket de Baileys
 * @param {object} msg - El mensaje de WhatsApp
 * @param {string} token - El token de la sesión
 * @param {string} estado - El estado actual ('inicio' o 'esperando_menu')
 * @param {string} texto - El texto del mensaje
 */
async function manejarMenu(sock, msg, token, estado, texto) {
  const jid = msg.key.remoteJid;

  // Si es la primera vez (o viene de un "hola"/"cancelar"), mostramos la bienvenida
  if (estado === "inicio") {
    await apiPost(`/api/sesiones/${token}/avanzar`, {
      estado: "esperando_menu",
      datos: {},
    });
    await sock.sendMessage(jid, { text: TEXTO_BIENVENIDA });
    return;
  }

  // Si está en 'esperando_menu', procesamos la opción
  const opcion = texto.trim();

  if (opcion === "1") {
    // TODO: derivar a reclamo.js
    await sock.sendMessage(jid, { text: TEXTO_PROXIMAMENTE });
    return;
  }

  if (opcion === "2") {
    // TODO: derivar a consultas.js
    await sock.sendMessage(jid, { text: TEXTO_PROXIMAMENTE });
    return;
  }

  if (opcion === "3") {
    // TODO: derivar a otrosCasos.js
    await sock.sendMessage(jid, { text: TEXTO_PROXIMAMENTE });
    return;
  }

  // Opción inválida
  await sock.sendMessage(jid, { text: TEXTO_OPCION_INVALIDA });
}

module.exports = {
  TEXTO_BIENVENIDA,
  manejarMenu,
};
