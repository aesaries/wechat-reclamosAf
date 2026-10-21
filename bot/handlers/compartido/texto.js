// bot/handlers/compartido/texto.js

/**
 * Extrae el teléfono (sin @dominio) de un jid.
 * Ej: "5493875005145@s.whatsapp.net" -> "5493875005145"
 */
function extraerTelefono(jid) {
  return jid.split("@")[0];
}

/**
 * Extrae el texto del mensaje, sea texto simple o texto extendido.
 */
function extraerTexto(msg) {
  return (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    ""
  ).trim();
}

/**
 * Obtiene el jid con teléfono real, contemplando la migración a LID de WhatsApp.
 * Prioriza el que termine en @s.whatsapp.net, y si ninguno lo hace, cae al remoteJid.
 */
function obtenerJidUsuario(msg) {
  const { remoteJid, remoteJidAlt } = msg.key;
  const esTelefono = (jid) => jid && jid.endsWith("@s.whatsapp.net");

  if (esTelefono(remoteJid)) return remoteJid;
  if (esTelefono(remoteJidAlt)) return remoteJidAlt;
  return remoteJid; // fallback
}

/**
 * Detecta si el mensaje es una foto.
 */
function esFoto(msg) {
  return !!msg.message?.imageMessage;
}

/**
 * Detecta si el mensaje es una ubicación en tiempo real (live location).
 */
function esUbicacionEnVivo(msg) {
  return !!msg.message?.liveLocationMessage;
}

/**
 * Extrae los datos de una ubicación fija (pin) de WhatsApp.
 * Devuelve un objeto { lat, lng, nombre, direccion_mapa } o null si no es locationMessage.
 */
function extraerUbicacion(msg) {
  const loc = msg.message?.locationMessage;
  if (!loc) return null;

  return {
    lat: loc.degreesLatitude,
    lng: loc.degreesLongitude,
    nombre: loc.name || null,
    direccion_mapa: loc.address || null,
  };
}

/**
 * Detecta si el mensaje es de un tipo que no podemos procesar en el flujo.
 * Devuelve un string con el tipo ("audio", "video", etc.),
 * "ignorar" para los que no merecen respuesta,
 * o null si el mensaje es procesable.
 */
function detectarMensajeNoSoportado(msg) {
  const m = msg.message;
  if (!m) return "ignorar";

  // Ignorar silenciosamente estos (no merecen respuesta)
  if (m.reactionMessage) return "ignorar";
  if (m.protocolMessage) return "ignorar";

  // Detectar tipos no soportados
  if (m.audioMessage) return "audio";
  if (m.videoMessage) return "video";
  if (m.documentMessage) return "documento";
  if (m.stickerMessage) return "sticker";
  if (m.contactMessage || m.contactsArrayMessage) return "contacto";
  if (m.pollCreationMessage || m.pollCreationMessageV3) return "encuesta";

  // Detectar si NO tiene contenido útil (ignorar silenciosamente)
  const tieneContenidoUtil =
    m.conversation ||
    m.extendedTextMessage ||
    m.imageMessage ||
    m.locationMessage ||
    m.liveLocationMessage;

  if (!tieneContenidoUtil) return "ignorar";

  return null;
}

/**
 * Devuelve el mensaje de respuesta para un tipo de mensaje no soportado.
 */
function mensajeNoSoportado(tipo) {
  const mensajes = {
    audio:
      "Por ahora no puedo escuchar audios. ¿Me lo escribís por texto? Gracias.",
    video: "Por ahora no puedo ver videos. ¿Me lo contás por texto? Gracias.",
    documento:
      "Por ahora no puedo abrir documentos. ¿Me lo escribís por texto? Gracias.",
    sticker: "No puedo procesar stickers. ¿Me lo escribís por texto? Gracias.",
    contacto:
      "Por ahora no puedo procesar contactos. ¿Me lo escribís por texto? Gracias.",
    encuesta:
      "No puedo procesar encuestas. ¿Me lo escribís por texto? Gracias.",
  };
  return (
    mensajes[tipo] ||
    "No puedo procesar ese tipo de mensaje. ¿Me lo escribís por texto?"
  );
}

module.exports = {
  extraerTelefono,
  extraerTexto,
  obtenerJidUsuario,
  esFoto,
  esUbicacionEnVivo,
  extraerUbicacion,
  detectarMensajeNoSoportado,
  mensajeNoSoportado,
};
