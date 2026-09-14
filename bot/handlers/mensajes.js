// bot/handlers/mensajes.js

async function manejarMensaje(sock, msg) {
  const remitente = msg.key.remoteJid; // ej: "5491122334455@s.whatsapp.net"

  // Extraemos el texto del mensaje (puede venir en distintas formas)
  const texto =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    '';

  console.log(`📨 Mensaje de ${remitente}: ${texto}`);

  // Respuesta automática simple (por ahora)
  const respuesta = '¡Hola! Recibí tu mensaje. Pronto te vamos a responder desde nuestro sistema de reclamos.';

  await sock.sendMessage(remitente, { text: respuesta });
}

module.exports = { manejarMensaje };