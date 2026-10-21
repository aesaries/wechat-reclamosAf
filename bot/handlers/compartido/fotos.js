// bot/handlers/compartido/fotos.js
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");

// Configuración
const MAX_FOTOS = 3;
const UPLOADS_DIR = path.join(__dirname, "..", "..", "..", "uploads");

/**
 * Descarga una imagen de un mensaje de WhatsApp y la guarda en uploads/.
 * Devuelve la ruta relativa del archivo guardado, o null si falla.
 *
 * @param {object} msg - El mensaje de WhatsApp
 * @param {string} token - El token de la sesión (para nombrar el archivo)
 * @param {number} indice - El número de foto (1, 2, 3)
 * @returns {Promise<string|null>} Ruta relativa (ej: "uploads/token_123_1.jpg") o null
 */
async function descargarYGuardarFoto(msg, token, indice) {
  try {
    const buffer = await downloadMediaMessage(
      msg,
      "buffer",
      {},
      {
        logger: console,
        reuploadRequest: null,
      },
    );

    // Determinamos la extensión según el mime type
    const mime = msg.message.imageMessage.mimetype || "image/jpeg";
    const ext = mime.split("/")[1] || "jpg";

    // Nombre único: token + timestamp + índice + extensión
    const nombreArchivo = `${token}_${Date.now()}_${indice}.${ext}`;
    const rutaCompleta = path.join(UPLOADS_DIR, nombreArchivo);

    // Guardamos en disco
    fs.writeFileSync(rutaCompleta, buffer);

    // Devolvemos la ruta relativa (lo que se guarda en DB)
    return `uploads/${nombreArchivo}`;
  } catch (err) {
    console.error("❌ Error descargando foto:", err);
    return null;
  }
}

/**
 * Procesa una foto entrante: la descarga, la guarda, y devuelve el objeto
 * listo para agregar al array de fotos de la sesión.
 *
 * @param {object} msg - El mensaje de WhatsApp (debe ser imageMessage)
 * @param {string} token - El token de la sesión
 * @param {array} fotosActuales - Array de fotos ya guardadas
 * @returns {Promise<object|null>} Objeto { mensaje_id, guardada_en, timestamp } o null
 */
async function procesarFotoEntrante(msg, token, fotosActuales) {
  const indice = fotosActuales.length + 1;
  const rutaGuardada = await descargarYGuardarFoto(msg, token, indice);

  if (!rutaGuardada) {
    return null;
  }

  return {
    mensaje_id: msg.key.id,
    guardada_en: rutaGuardada,
    timestamp: Date.now(),
  };
}

/**
 * Genera el texto de progreso para informar al usuario cuántas fotos lleva.
 */
function textoProgresoFotos(cantidad) {
  const restantes = MAX_FOTOS - cantidad;
  if (restantes > 0) {
    return `📸 Foto recibida (${cantidad}/${MAX_FOTOS}). Podés mandar ${restantes} más o escribir "listo" para continuar.`;
  }
  return `📸 Foto recibida (${cantidad}/${MAX_FOTOS}). Escribí "listo" para continuar.`;
}

module.exports = {
  MAX_FOTOS,
  UPLOADS_DIR,
  descargarYGuardarFoto,
  procesarFotoEntrante,
  textoProgresoFotos,
};
