// bot/handlers/otrosCasos.js
const { apiPost } = require("./compartido/api");

// ============================================================
// TEXTOS
// ============================================================

const TEXTO_OTROS_CASO = `¿Cuál de estos casos es?

1. Animales muertos
2. Poda de árboles (no de residuos)
3. Residuos peligrosos o patológicos
4. Limpieza de terrenos / vías / canales
5. Caso fuera de nuestra área
6. Otro caso especial`;

const RESPUESTAS = {
  animales_muertos:
    "🐾 Para animales muertos, comunicate con el 147 de la Municipalidad de Salta.",

  poda_arboles:
    "🌳 Para poda de árboles (no residuos de poda), comunicate con el 105 de la Municipalidad de Salta.",

  residuos_peligrosos:
    "⚠️ Para residuos peligrosos (pilas, tóners, aceites) o patológicos, comunicate con Hábitat Ecológico: 4283490.",

  limpieza_terrenos:
    "Para limpieza de terrenos baldíos, vías del ferrocarril o canales que no nos corresponden, comunicate con el 147 de la Municipalidad de Salta.",

  fuera_area:
    "Ese caso corresponde a otra jurisdicción. Por favor, comunicate con la Municipalidad de tu localidad.",

  otro: "Para casos especiales no contemplados, comunicate con el 147 de la Municipalidad de Salta, o llamanos al [teléfono del CAO] en horario de 8 a 16 hs.",
};

const CASOS = {
  1: "animales_muertos",
  2: "poda_arboles",
  3: "residuos_peligrosos",
  4: "limpieza_terrenos",
  5: "fuera_area",
  6: "otro",
};

const TEXTO_CIERRE = `¿Necesitás algo más?

1. Sí, volver al menú
2. No, gracias`;

const TEXTO_GRACIAS =
  '¡Gracias por comunicarte! 👋 Si necesitás algo más, escribí "hola" cuando quieras.';

const TEXTO_MENU = `¡Hola! 👋 Soy el asistente virtual de Agrotécnica Fueguina.

¿En qué puedo ayudarte?

1. Hacer un reclamo
2. Consultar horarios o frecuencias
3. Otros casos`;

// ============================================================
// HANDLER
// ============================================================

async function manejarOtrosCasos(sock, msg, token, estado, texto) {
  const jid = msg.key.remoteJid;

  switch (estado) {
    // ============================================================
    // Menú de casos
    // ============================================================
    case "esperando_otros_caso": {
      const caso = CASOS[texto.trim()];
      if (!caso) {
        await sock.sendMessage(jid, {
          text: "No entendí. Elegí una opción del 1 al 6.",
        });
        return;
      }

      await sock.sendMessage(jid, { text: RESPUESTAS[caso] });

      await apiPost(`/api/sesiones/${token}/avanzar`, {
        estado: "esperando_otros_cierre",
        datos: { otros_caso: caso },
      });
      await sock.sendMessage(jid, { text: TEXTO_CIERRE });
      return;
    }

    // ============================================================
    // Cierre
    // ============================================================
    case "esperando_otros_cierre": {
      const opcion = texto.trim();

      if (opcion === "1") {
        await apiPost(`/api/sesiones/${token}/avanzar`, {
          estado: "esperando_menu",
          datos: {},
        });
        await sock.sendMessage(jid, { text: TEXTO_MENU });
        return;
      }

      if (opcion === "2") {
        await sock.sendMessage(jid, { text: TEXTO_GRACIAS });
        await apiPost(`/api/sesiones/${token}/avanzar`, {
          estado: "finalizado",
        });
        return;
      }

      await sock.sendMessage(jid, {
        text: "No entendí. Escribí 1 para volver al menú o 2 para terminar.",
      });
      return;
    }

    default:
      console.warn("⚠️ Estado de otros casos desconocido:", estado);
      await sock.sendMessage(jid, {
        text: 'Hubo un problema. Escribí "hola" para volver al menú.',
      });
  }
}

module.exports = {
  TEXTO_OTROS_CASO,
  RESPUESTAS,
  CASOS,
  manejarOtrosCasos,
};
