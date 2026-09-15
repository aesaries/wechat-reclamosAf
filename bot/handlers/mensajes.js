// bot/handlers/mensajes.js

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

/**
 * Extrae el teléfono limpio del JID de WhatsApp.
 * Ej: "5491122334455@s.whatsapp.net" -> "5491122334455"
 */
function extraerTelefono(jid) {
  return jid.split('@')[0];
}

async function manejarMensaje(sock, msg) {
  const remitente = msg.key.remoteJid;
  const telefono = extraerTelefono(remitente);

  const texto =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    '';

  console.log(`📨 Mensaje de ${telefono}: ${texto}`);

  try {
    // 1. Le pedimos al backend la sesión (crea usuario/sesión si no existe)
    const respuesta = await fetch(`${BACKEND_URL}/api/sesiones/desde-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telefono }),
    });

    const datos = await respuesta.json();

    if (!datos.ok) {
      throw new Error('El backend no devolvió una sesión válida');
    }

    // 2. Respondemos con el enlace al webchat
    const mensaje = `¡Hola! Para gestionar tu reclamo, ingresá acá:\n${datos.url_webchat}`;
    await sock.sendMessage(remitente, { text: mensaje });

    console.log(`✅ Enlace enviado a ${telefono}`);
  } catch (err) {
    console.error('❌ Error llamando al backend:', err.message);
    await sock.sendMessage(remitente, {
      text: 'Ups, hubo un problema. Intentá de nuevo en unos minutos.',
    });
  }
}

module.exports = { manejarMensaje };