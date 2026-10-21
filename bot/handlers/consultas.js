// bot/handlers/consultas.js
const { apiPost } = require("./compartido/api");

// ============================================================
// TEXTOS
// ============================================================

const TEXTO_CONSULTA_SERVICIO = `¿Sobre qué servicio querés consultar?

1. Recolección
2. Barrido
3. Poda
4. Escombros`;

const RESPUESTAS = {
  recoleccion: `🗓️ Horarios de recolección:

Turno matutino: a partir de las 6 AM, de lunes a sábado.
Turno nocturno: a partir de las 21 hs, de domingo a viernes.

Recordá dejar los residuos correctamente acondicionados.`,

  barrido: `🧹 Frecuencia de barrido:

El servicio se realiza 2 veces por semana en tu zona.

Si notás que no se está cumpliendo, podés hacer un reclamo desde el menú principal.`,

  poda: `🌳 Poda acondicionada:

• Máximo 1 m³ (equivalente a 4 bolsas medianas de consorcio).
• Debe estar atada o embolsada.
• Se retira en el mismo horario que la recolección normal de tu barrio.

Si está acondicionada y no la retiran, podés hacer un reclamo.`,

  escombros: `🧱 Escombros acondicionados:

• Máximo 1 m³ (equivalente a 4 bolsas medianas de consorcio).
• En bolsas livianas (no muy pesadas).
• Se retiran en el mismo horario que la recolección normal de tu barrio.

Si están acondicionados y no los retiran, podés hacer un reclamo.`,
};

const SERVICIOS = {
  1: "recoleccion",
  2: "barrido",
  3: "poda",
  4: "escombros",
};

const TEXTO_CIERRE = `¿Necesitás algo más?

1. Sí, volver al menú
2. No, gracias`;

const TEXTO_GRACIAS =
  '¡Gracias por comunicarte! 👋 Si necesitás algo más, escribí "hola" cuando quieras.';

// ============================================================
// HANDLER
// ============================================================

async function manejarConsulta(sock, msg, token, estado, texto) {
  const jid = msg.key.remoteJid;

  switch (estado) {
    // ============================================================
    // Menú de servicios de consulta
    // ============================================================
    case "esperando_consulta_servicio": {
      const servicio = SERVICIOS[texto.trim()];
      if (!servicio) {
        await sock.sendMessage(jid, {
          text: "No entendí. Elegí una opción del 1 al 4.",
        });
        return;
      }

      await sock.sendMessage(jid, { text: RESPUESTAS[servicio] });

      await apiPost(`/api/sesiones/${token}/avanzar`, {
        estado: "esperando_consulta_cierre",
        datos: { consulta_servicio: servicio },
      });
      await sock.sendMessage(jid, { text: TEXTO_CIERRE });
      return;
    }

    // ============================================================
    // Cierre de la consulta
    // ============================================================
    case "esperando_consulta_cierre": {
      const opcion = texto.trim();

      if (opcion === "1") {
        await apiPost(`/api/sesiones/${token}/avanzar`, {
          estado: "esperando_menu",
          datos: {},
        });
        await sock.sendMessage(jid, {
          text: `¡Hola! 👋 Soy el asistente virtual de Agrotécnica Fueguina.

¿En qué puedo ayudarte?

1. Hacer un reclamo
2. Consultar horarios o frecuencias
3. Otros casos`,
        });
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
      console.warn("⚠️ Estado de consulta desconocido:", estado);
      await sock.sendMessage(jid, {
        text: 'Hubo un problema. Escribí "hola" para volver al menú.',
      });
  }
}

module.exports = {
  TEXTO_CONSULTA_SERVICIO,
  RESPUESTAS,
  SERVICIOS,
  manejarConsulta,
};
