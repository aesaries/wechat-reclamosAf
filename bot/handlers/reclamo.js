// bot/handlers/reclamo.js
const { apiPost } = require("./compartido/api");
const {
  esFoto,
  esUbicacionEnVivo,
  extraerUbicacion,
} = require("./compartido/texto");
const {
  MAX_FOTOS,
  procesarFotoEntrante,
  textoProgresoFotos,
} = require("./compartido/fotos");
const { procesarUbicacion } = require("./compartido/ubicacion");
const {
  cancelarRecordatorio,
  programarRecordatorioFotos,
  programarRecordatorioObligatorio,
} = require("./compartido/recordatorios");

// ============================================================
// TEXTOS
// ============================================================

const TEXTO_SERVICIO = `¿Sobre qué servicio?

1. Recolección de residuos
2. Barrido
3. Poda acondicionada
4. Escombros acondicionados
5. Microbasurales
6. Situación particular`;

const TEXTO_ACONDICIONAMIENTO = `¿Está acondicionado según las reglas?
(máximo 1 m³, atado o embolsado)

1. Sí, está acondicionado
2. No está acondicionado`;

const TEXTO_VOLUMEN = `¿Cuánto volumen estimás?

1. Menos de 1 m³ (menos de 4 bolsas)
2. Aproximadamente 1 m³ (4 bolsas)
3. Más de 1 m³`;

const TEXTO_DESCRIPCION_PARTICULAR = `Entiendo. Contame brevemente qué pasó.

[Texto libre, mínimo 30 caracteres, máximo 1000]`;

const TEXTO_CUANDO = `¿Cuándo ocurrió?

1. Hoy
2. Ayer
3. Hace 2 días
4. Hace más de 2 días`;

const TEXTO_BARRIO = "¿Cuál es tu barrio?";

const TEXTO_DIRECCION = "¿Cuál es la dirección? (calle, número)";

const TEXTO_DIRECCION_DETALLADA = `¿Cuál es la dirección? Necesito el mayor detalle posible para que el chofer encuentre el lugar:

• Calle y número
• Entre calles
• Referencia (ej: "frente a la plaza", "al lado del kiosco")`;

const TEXTO_UBICACION = `📍 Necesito tu ubicación GPS para que el chofer pueda encontrar el lugar.

Tocá clip 📎 → Ubicación → Enviar mi ubicación actual.
Podés mover el pin en el mapa para marcar el punto exacto.

Si no podés compartirla, escribí "no puedo".`;

const TEXTO_UBICACION_ESCAPE = `Entiendo que no podés compartir la ubicación. El reclamo se va a registrar solo con la dirección escrita.

⚠️ Importante: sin la ubicación GPS, el chofer puede tener más dificultades para encontrar el lugar exacto.

¿Querés continuar sin ubicación?

1. Sí, continuar
2. No, prefiero intentar de nuevo`;

const TEXTO_UBICACION_OPCIONAL = `¿Querés compartir tu ubicación GPS? (opcional)

Tocá clip 📎 → Ubicación → Enviar mi ubicación actual.

Si no querés compartirla, escribí "saltar".`;

const TEXTO_FOTO = `📸 Necesito al menos una foto del problema para poder registrar el reclamo.
Máximo 3 fotos.
Cuando termines, escribí "listo".

Si no podés mandar fotos, escribí "no puedo".`;

const TEXTO_FOTO_ESCAPE = `Entiendo que no podés mandar la foto. El reclamo se va a registrar como "sin foto".

⚠️ Importante: los reclamos sin foto pueden demorar más en procesarse, ya que el equipo tiene que verificar la situación en el lugar.

¿Querés continuar sin foto?

1. Sí, continuar
2. No, prefiero intentar de nuevo`;

const TEXTO_FOTO_OPCIONAL = `¿Tenés fotos o videos del hecho? (opcional, hasta 3 archivos)

📎 Enviá los archivos o escribí "listo" para continuar.
Si no querés agregar ninguno, escribí "saltar".

Nota: los videos son de mucha ayuda como respaldo.`;

const TEXTO_NOMBRE = "¿Me confirmás tu nombre y apellido?";

const TEXTO_COMENTARIOS = `¿Algún comentario extra? (opcional)

Escribí "saltar" si no querés agregar nada.`;

// ============================================================
// OPCIONES
// ============================================================

const SERVICIOS = {
  1: { slug: "recoleccion", nombre: "Recolección de residuos" },
  2: { slug: "barrido", nombre: "Barrido" },
  3: { slug: "poda", nombre: "Poda acondicionada" },
  4: { slug: "escombros", nombre: "Escombros acondicionados" },
  5: { slug: "microbasural", nombre: "Microbasurales" },
  6: { slug: "situacion_particular", nombre: "Situación particular" },
};

const ACONDICIONAMIENTO = {
  1: "acondicionado_si",
  2: "acondicionado_no",
};

const VOLUMEN = {
  1: "menos_1m3",
  2: "aprox_1m3",
  3: "mas_1m3",
};

const CUANDO = {
  1: "hoy",
  2: "ayer",
  3: "hace_2_dias",
  4: "mas_2_dias",
};

// ============================================================
// HELPERS INTERNOS
// ============================================================

function parsearDatos(sesionData) {
  return sesionData.datos_temporales
    ? JSON.parse(sesionData.datos_temporales)
    : {};
}

/**
 * Detecta si el texto es un escape ("no puedo", "no me deja", etc.)
 */
function esEscape(texto) {
  const t = texto.toLowerCase().trim();
  const palabras = [
    "no puedo",
    "no me deja",
    "no se como",
    "no sé cómo",
    "no tengo",
    "no se puede",
    "no funciona",
    "sin foto",
    "sin ubicacion",
    "sin ubicación",
  ];
  return palabras.some((p) => t.includes(p));
}

/**
 * Detecta si el texto es una confirmación ("sí", "dale", "ok", "1")
 */
function esConfirmacion(texto) {
  const t = texto.toLowerCase().trim();
  return ["si", "sí", "dale", "ok", "1"].includes(t);
}

/**
 * Detecta si el texto es una negación ("no", "2")
 */
function esNegacion(texto) {
  const t = texto.toLowerCase().trim();
  return ["no", "2"].includes(t);
}

// ============================================================
// HANDLER PRINCIPAL
// ============================================================

async function manejarReclamo(sock, msg, token, estado, texto, sesionData) {
  const jid = msg.key.remoteJid;
  const datos = parsearDatos(sesionData);

  switch (estado) {
    // ============================================================
    // Menú de servicios
    // ============================================================
    case "esperando_reclamo_servicio": {
      const servicio = SERVICIOS[texto.trim()];
      if (!servicio) {
        await sock.sendMessage(jid, {
          text: "No entendí. Elegí una opción del 1 al 6.",
        });
        return;
      }

      // Si es poda o escombros, preguntamos acondicionamiento
      if (servicio.slug === "poda" || servicio.slug === "escombros") {
        await apiPost(`/api/sesiones/${token}/avanzar`, {
          estado: "esperando_acondicionamiento",
          datos: { servicio: servicio.slug },
        });
        await sock.sendMessage(jid, { text: TEXTO_ACONDICIONAMIENTO });
        return;
      }

      // Si es situación particular, pedimos descripción
      if (servicio.slug === "situacion_particular") {
        await apiPost(`/api/sesiones/${token}/avanzar`, {
          estado: "esperando_descripcion_particular",
          datos: { servicio: servicio.slug, prioridad: "alta" },
        });
        await sock.sendMessage(jid, { text: TEXTO_DESCRIPCION_PARTICULAR });
        return;
      }

      // Recolección, barrido, microbasurales → directo a "cuándo"
      await apiPost(`/api/sesiones/${token}/avanzar`, {
        estado: "esperando_cuando",
        datos: { servicio: servicio.slug },
      });
      await sock.sendMessage(jid, { text: TEXTO_CUANDO });
      return;
    }

    // ============================================================
    // Acondicionamiento (poda/escombros)
    // ============================================================
    case "esperando_acondicionamiento": {
      const valor = ACONDICIONAMIENTO[texto.trim()];
      if (!valor) {
        await sock.sendMessage(jid, { text: "No entendí. Elegí 1 o 2." });
        return;
      }
      await apiPost(`/api/sesiones/${token}/avanzar`, {
        estado: "esperando_volumen",
        datos: { acondicionamiento: valor },
      });
      await sock.sendMessage(jid, { text: TEXTO_VOLUMEN });
      return;
    }

    // ============================================================
    // Volumen (poda/escombros)
    // ============================================================
    case "esperando_volumen": {
      const valor = VOLUMEN[texto.trim()];
      if (!valor) {
        await sock.sendMessage(jid, { text: "No entendí. Elegí 1, 2 o 3." });
        return;
      }
      await apiPost(`/api/sesiones/${token}/avanzar`, {
        estado: "esperando_cuando",
        datos: { volumen: valor },
      });
      await sock.sendMessage(jid, { text: TEXTO_CUANDO });
      return;
    }

    // ============================================================
    // Descripción libre (situación particular)
    // ============================================================
    case "esperando_descripcion_particular": {
      if (texto.length < 30) {
        await sock.sendMessage(jid, {
          text: "Necesito un poco más de detalle para poder ayudarte.\nContame qué pasó, cuándo y dónde (mínimo 30 caracteres).",
        });
        return;
      }
      await apiPost(`/api/sesiones/${token}/avanzar`, {
        estado: "esperando_cuando",
        datos: { descripcion_libre: texto },
      });
      await sock.sendMessage(jid, { text: TEXTO_CUANDO });
      return;
    }

    // ============================================================
    // Cuándo ocurrió
    // ============================================================
    case "esperando_cuando": {
      const valor = CUANDO[texto.trim()];
      if (!valor) {
        await sock.sendMessage(jid, { text: "No entendí. Elegí 1, 2, 3 o 4." });
        return;
      }
      await apiPost(`/api/sesiones/${token}/avanzar`, {
        estado: "esperando_barrio",
        datos: { cuando: valor },
      });
      await sock.sendMessage(jid, { text: TEXTO_BARRIO });
      return;
    }

    // ============================================================
    // Barrio
    // ============================================================
    case "esperando_barrio": {
      if (!texto) {
        await sock.sendMessage(jid, { text: "Escribí tu barrio." });
        return;
      }
      await apiPost(`/api/sesiones/${token}/avanzar`, {
        estado: "esperando_direccion",
        datos: { barrio: texto },
      });
      await sock.sendMessage(jid, { text: TEXTO_DIRECCION });
      return;
    }

    // ============================================================
    // Dirección
    // ============================================================
    case "esperando_direccion": {
      if (!texto) {
        await sock.sendMessage(jid, { text: "Escribí la dirección." });
        return;
      }
      await apiPost(`/api/sesiones/${token}/avanzar`, {
        estado: "esperando_ubicacion",
        datos: { direccion: texto },
      });

      // Si es situación particular, ubicación es opcional
      if (datos.servicio === "situacion_particular") {
        await sock.sendMessage(jid, { text: TEXTO_UBICACION_OPCIONAL });
        return;
      }

      // Si es servicio, ubicación es obligatoria
      await sock.sendMessage(jid, { text: TEXTO_UBICACION });
      programarRecordatorioObligatorio(sock, jid, token, "ubicación");
      return;
    }

    // ============================================================
    // Ubicación
    // ============================================================
    case "esperando_ubicacion": {
      const textoLower = texto.toLowerCase();
      const esParticular = datos.servicio === "situacion_particular";

      // Si es particular y escribe "saltar" → avanza
      if (esParticular && textoLower === "saltar") {
        cancelarRecordatorio(token);
        await apiPost(`/api/sesiones/${token}/avanzar`, {
          estado: "esperando_foto",
          datos: { tiene_ubicacion: false },
        });
        await sock.sendMessage(jid, { text: TEXTO_FOTO_OPCIONAL });
        return;
      }

      // Si es servicio y escribe "no puedo" → ofrece escape
      if (!esParticular && esEscape(texto)) {
        cancelarRecordatorio(token);
        await apiPost(`/api/sesiones/${token}/avanzar`, {
          estado: "esperando_ubicacion_escape_confirmacion",
        });
        await sock.sendMessage(jid, { text: TEXTO_UBICACION_ESCAPE });
        return;
      }

      // Live location → aviso único
      if (esUbicacionEnVivo(msg)) {
        if (!datos.aviso_live_location) {
          await apiPost(`/api/sesiones/${token}/avanzar`, {
            estado: "esperando_ubicacion",
            datos: { aviso_live_location: true },
          });
          await sock.sendMessage(jid, {
            text: "Recibí una ubicación en tiempo real, pero para el reclamo necesito una *fija*.\n\nTocá clip 📎 → Ubicación → Enviar mi ubicación actual.",
          });
        }
        return;
      }

      // Ubicación fija → guardar
      const ubicacion = extraerUbicacion(msg);
      if (ubicacion) {
        cancelarRecordatorio(token);
        const procesada = procesarUbicacion(ubicacion);
        await apiPost(`/api/sesiones/${token}/avanzar`, {
          estado: "esperando_foto",
          datos: {
            ubicacion: procesada,
            tiene_ubicacion: true,
            sin_ubicacion: false,
          },
        });

        if (esParticular) {
          await sock.sendMessage(jid, { text: TEXTO_FOTO_OPCIONAL });
        } else {
          await sock.sendMessage(jid, { text: TEXTO_FOTO });
          programarRecordatorioObligatorio(sock, jid, token, "foto");
        }
        return;
      }

      // Cualquier otra cosa
      await sock.sendMessage(jid, {
        text: esParticular
          ? 'No entendí. Compartí tu ubicación, o escribí "saltar" para continuar.'
          : 'No entendí. Compartí tu ubicación (clip 📎 → Ubicación), o escribí "no puedo".',
      });
      return;
    }

    // ============================================================
    // Confirmación del escape de ubicación
    // ============================================================
    case "esperando_ubicacion_escape_confirmacion": {
      if (esConfirmacion(texto)) {
        cancelarRecordatorio(token);
        await apiPost(`/api/sesiones/${token}/avanzar`, {
          estado: "esperando_direccion_detallada",
          datos: {
            tiene_ubicacion: false,
            sin_ubicacion: true,
            motivo_sin_ubicacion:
              "Usuario indicó que no puede compartir ubicación",
          },
        });
        await sock.sendMessage(jid, { text: TEXTO_DIRECCION_DETALLADA });
        return;
      }
      if (esNegacion(texto)) {
        // Volver al paso de ubicación
        await apiPost(`/api/sesiones/${token}/avanzar`, {
          estado: "esperando_ubicacion",
        });
        await sock.sendMessage(jid, { text: TEXTO_UBICACION });
        programarRecordatorioObligatorio(sock, jid, token, "ubicación");
        return;
      }
      await sock.sendMessage(jid, {
        text: "No entendí. Elegí 1 (sí) o 2 (no).",
      });
      return;
    }

    // ============================================================
    // Dirección detallada (cuando no hay GPS)
    // ============================================================
    case "esperando_direccion_detallada": {
      if (!texto || texto.length < 10) {
        await sock.sendMessage(jid, {
          text: "Necesito más detalle en la dirección. Incluí calle, número y alguna referencia.",
        });
        return;
      }
      await apiPost(`/api/sesiones/${token}/avanzar`, {
        estado: "esperando_foto",
        datos: { direccion_detallada: texto },
      });
      await sock.sendMessage(jid, { text: TEXTO_FOTO });
      programarRecordatorioObligatorio(sock, jid, token, "foto");
      return;
    }

    // ============================================================
    // Fotos
    // ============================================================
    case "esperando_foto": {
      const textoLower = texto.toLowerCase();
      const esParticular = datos.servicio === "situacion_particular";
      const fotos = datos.fotos || [];

      // Llegó una foto
      if (esFoto(msg)) {
        if (fotos.length >= MAX_FOTOS) {
          await sock.sendMessage(jid, {
            text: `Ya recibimos el máximo de ${MAX_FOTOS} fotos. Escribí "listo" para continuar.`,
          });
          return;
        }

        const nuevaFoto = await procesarFotoEntrante(msg, token, fotos);
        if (!nuevaFoto) {
          await sock.sendMessage(jid, {
            text: "Hubo un problema al guardar la foto. Intentá de nuevo.",
          });
          return;
        }
        fotos.push(nuevaFoto);

        await apiPost(`/api/sesiones/${token}/avanzar`, {
          estado: "esperando_foto",
          datos: { fotos, tiene_foto: true, sin_foto: false },
        });

        await sock.sendMessage(jid, { text: textoProgresoFotos(fotos.length) });
        programarRecordatorioFotos(sock, jid, token);
        return;
      }

      // Escribió "listo"
      if (textoLower === "listo") {
        cancelarRecordatorio(token);

        if (esParticular) {
          // En particular, foto es opcional. Avanza.
          await apiPost(`/api/sesiones/${token}/avanzar`, {
            estado: "esperando_nombre",
            datos: {
              tiene_foto: fotos.length > 0,
              sin_foto: fotos.length === 0,
            },
          });
          await sock.sendMessage(jid, { text: TEXTO_NOMBRE });
          return;
        }

        // En servicio, requiere al menos 1 foto
        if (fotos.length === 0) {
          await sock.sendMessage(jid, {
            text: 'Todavía no recibí ninguna foto. Necesito al menos una para continuar, o escribí "no puedo".',
          });
          return;
        }

        await apiPost(`/api/sesiones/${token}/avanzar`, {
          estado: "esperando_nombre",
          datos: { tiene_foto: true, sin_foto: false },
        });
        await sock.sendMessage(jid, { text: TEXTO_NOMBRE });
        return;
      }

      // Escape de foto (solo servicio)
      if (!esParticular && esEscape(texto)) {
        cancelarRecordatorio(token);
        await apiPost(`/api/sesiones/${token}/avanzar`, {
          estado: "esperando_foto_escape_confirmacion",
        });
        await sock.sendMessage(jid, { text: TEXTO_FOTO_ESCAPE });
        return;
      }

      // Particular: "saltar" avanza
      if (esParticular && textoLower === "saltar") {
        cancelarRecordatorio(token);
        await apiPost(`/api/sesiones/${token}/avanzar`, {
          estado: "esperando_nombre",
          datos: {
            tiene_foto: false,
            sin_foto: true,
            motivo_sin_foto: "Usuario decidió no mandar foto",
          },
        });
        await sock.sendMessage(jid, { text: TEXTO_NOMBRE });
        return;
      }

      // Cualquier otra cosa
      await sock.sendMessage(jid, {
        text: esParticular
          ? 'No entendí. Mandá una foto, escribí "listo" o "saltar".'
          : 'No entendí. Mandá una foto, escribí "listo", o "no puedo".',
      });
      return;
    }

    // ============================================================
    // Confirmación del escape de foto
    // ============================================================
    case "esperando_foto_escape_confirmacion": {
      if (esConfirmacion(texto)) {
        cancelarRecordatorio(token);
        await apiPost(`/api/sesiones/${token}/avanzar`, {
          estado: "esperando_nombre",
          datos: {
            tiene_foto: false,
            sin_foto: true,
            motivo_sin_foto: "Usuario indicó que no puede mandar foto",
          },
        });
        await sock.sendMessage(jid, { text: TEXTO_NOMBRE });
        return;
      }
      if (esNegacion(texto)) {
        await apiPost(`/api/sesiones/${token}/avanzar`, {
          estado: "esperando_foto",
        });
        await sock.sendMessage(jid, { text: TEXTO_FOTO });
        programarRecordatorioObligatorio(sock, jid, token, "foto");
        return;
      }
      await sock.sendMessage(jid, {
        text: "No entendí. Elegí 1 (sí) o 2 (no).",
      });
      return;
    }

    // ============================================================
    // Nombre
    // ============================================================
    case "esperando_nombre": {
      if (!texto) {
        await sock.sendMessage(jid, { text: "Escribí tu nombre." });
        return;
      }
      await apiPost(`/api/sesiones/${token}/avanzar`, {
        estado: "esperando_comentarios",
        datos: { nombre: texto },
      });
      await sock.sendMessage(jid, { text: TEXTO_COMENTARIOS });
      return;
    }

    // ============================================================
    // Comentarios
    // ============================================================
    case "esperando_comentarios": {
      const textoLower = texto.toLowerCase();
      const comentarios = textoLower === "saltar" ? null : texto;

      await apiPost(`/api/sesiones/${token}/avanzar`, {
        estado: "esperando_aceptacion_terminos",
        datos: { comentarios },
      });

      if (datos.servicio === "situacion_particular") {
        await sock.sendMessage(jid, {
          text: `Al enviar esta solicitud, aceptás los siguientes términos:

• La empresa evaluará el caso con prioridad y se comunicará a la brevedad.
• La información será tratada de manera confidencial.
• La empresa se reserva el derecho de aceptar o rechazar la solicitud.
• Plazo de respuesta: hasta 15 días hábiles.
• Jurisdicción: tribunales de la ciudad de Salta, Argentina.

¿Aceptás estos términos y querés enviar el reclamo?

1. Sí, enviar
2. No, cancelar`,
        });
      } else {
        await sock.sendMessage(jid, {
          text: `Antes de enviar, tené en cuenta:

• Plazo: 48 hs desde el hecho.
• Respuesta: hasta 15 días hábiles.
• Datos confidenciales.

Aceptás los términos completos:
https://af-salta.com.ar/terminos

¿Confirmás el envío?

1. Sí, enviar
2. No, cancelar`,
        });
      }
      return;
    }

    // ============================================================
    // Términos y confirmación
    // ============================================================
    case "esperando_aceptacion_terminos": {
      if (!esConfirmacion(texto)) {
        await sock.sendMessage(jid, {
          text: 'Para enviar el reclamo necesito que confirmes escribiendo "1" o "sí". Si querés cancelar, escribí "cancelar".',
        });
        return;
      }

      const resultado = await apiPost(`/api/sesiones/${token}/finalizar`, {
        acepto_terminos: true,
      });

      if (!resultado.ok) {
        await sock.sendMessage(jid, {
          text: "Hubo un error al guardar tu reclamo. Intentá de nuevo en unos minutos.",
        });
        return;
      }

      const numero =
        resultado.reclamo.numero_reclamo || `#${resultado.reclamo.id}`;

      if (datos.servicio === "situacion_particular") {
        await sock.sendMessage(jid, {
          text: `✅ Reclamo ${numero} registrado.

Tipo: Situación particular
Barrio: ${datos.barrio || "-"}

Por la naturaleza de tu caso, un responsable va a revisarlo con prioridad.
Te van a contactar a la brevedad.

Guardá tu número de reclamo.`,
        });
      } else {
        await sock.sendMessage(jid, {
          text: `✅ Reclamo ${numero} registrado.

Servicio: ${SERVICIOS[datos.servicio]?.nombre || datos.servicio}
Barrio: ${datos.barrio || "-"}
Dirección: ${datos.direccion || "-"}

Te vamos a contactar a la brevedad.

Guardá tu número de reclamo para futuras consultas.`,
        });
      }
      return;
    }

    default:
      console.warn("⚠️ Estado de reclamo desconocido:", estado);
      await sock.sendMessage(jid, {
        text: 'Hubo un problema. Escribí "hola" para volver al menú.',
      });
  }
}

module.exports = {
  // ... todas las exportaciones anteriores ...
  manejarReclamo,
};

module.exports = {
  TEXTO_SERVICIO,
  TEXTO_ACONDICIONAMIENTO,
  TEXTO_VOLUMEN,
  TEXTO_DESCRIPCION_PARTICULAR,
  TEXTO_CUANDO,
  TEXTO_BARRIO,
  TEXTO_DIRECCION,
  TEXTO_DIRECCION_DETALLADA,
  TEXTO_UBICACION,
  TEXTO_UBICACION_ESCAPE,
  TEXTO_UBICACION_OPCIONAL,
  TEXTO_FOTO,
  TEXTO_FOTO_ESCAPE,
  TEXTO_FOTO_OPCIONAL,
  TEXTO_NOMBRE,
  TEXTO_COMENTARIOS,
  SERVICIOS,
  ACONDICIONAMIENTO,
  VOLUMEN,
  CUANDO,
  manejarReclamo,
};
