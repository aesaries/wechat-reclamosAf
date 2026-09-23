// bot/handlers/mensajes.js
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

// Mapa de timers activos, uno por sesión (token)
const timersRecordatorio = new Map();
const MAX_FOTOS = 3;
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
const RECORDATORIO_MS = 30 * 1000; // 30 segundos
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

// ============================================================
// Opciones de cada paso (deben coincidir con lo que espera el flujo)
// ============================================================
const OPCIONES_TIPO = {
  '1': 'residuos',
  '2': 'poda',
  '3': 'escombros',
  '4': 'otro',
};

const OPCIONES_SUBTIPO = {
  residuos: {
    '1': 'no_levantan',
    '2': 'contenedor_desbordado',
    '3': 'fuera_de_horario',
  },
  poda: {
    '1': 'no_acondicionada',
    '2': 'supera_1m3',
    '3': 'no_retirada',
  },
  escombros: {
    '1': 'via_publica',
    '2': 'sin_autorizacion',
  },
  otro: {
    '1': 'otro',
  },
};

// ============================================================
// Textos de las preguntas
// ============================================================
const TEXTO_TIPO = `¡Hola! Soy el asistente de reclamos. ¿Qué querés reportar?

1️⃣ Recolección de residuos
2️⃣ Poda
3️⃣ Escombros
4️⃣ Otro

Respondé con el número.`;

const TEXTO_SUBTIPO = {
  residuos: `Entendido, residuos. ¿Cuál es el problema?

1️⃣ No levantan la basura
2️⃣ Contenedor desbordado
3️⃣ Recolección fuera de horario

Respondé con el número.`,
  poda: `Entendido, poda. ¿Cuál es el problema?

1️⃣ Poda no acondicionada (no está atada)
2️⃣ Supera 1 m³
3️⃣ Poda acondicionada pero no retirada

Respondé con el número.`,
  escombros: `Entendido, escombros. ¿Cuál es el problema?

1️⃣ Escombro en la vía pública
2️⃣ Escombro sin autorización

Respondé con el número.`,
  otro: `Entendido, otro. Describí brevemente el problema.`,
};

const TEXTO_DIRECCION = `¿Cuál es la dirección? (calle, número, barrio)`;
const TEXTO_NOMBRE = `¿Me confirmás tu nombre y apellido?`;
const TEXTO_FOTO = `¿Querés mandar fotos del problema? (opcional)

Máximo 3 fotos.
Cuando termines, escribí "listo".
Si no querés mandar ninguna, escribí "saltar".`;

// ============================================================
// Helpers para llamar al backend
// ============================================================
async function apiPost(ruta, body = {}) {
  const resp = await fetch(`${BACKEND_URL}${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return resp.json();
}

function extraerTelefono(jid) {
  return jid.split('@')[0];
}

/**
 * Descarga una imagen de un mensaje de WhatsApp y la guarda en uploads/.
 * Devuelve la ruta relativa del archivo guardado.
 */
async function descargarYGuardarFoto(msg, token, indice) {
  try {
    const buffer = await downloadMediaMessage(
      msg,
      'buffer',
      {},
      {
        logger: console,
        reuploadRequest: null,
      }
    );

    // Determinamos la extensión según el mime type
    const mime = msg.message.imageMessage.mimetype || 'image/jpeg';
    const ext = mime.split('/')[1] || 'jpg';

    // Nombre único: token + timestamp + índice + extensión
    const nombreArchivo = `${token}_${Date.now()}_${indice}.${ext}`;
    const rutaCompleta = path.join(UPLOADS_DIR, nombreArchivo);

    // Guardamos en disco
    fs.writeFileSync(rutaCompleta, buffer);

    // Devolvemos la ruta relativa (lo que se guarda en DB)
    return `uploads/${nombreArchivo}`;
  } catch (err) {
    console.error('❌ Error descargando foto:', err);
    return null;
  }
}

function extraerTexto(msg) {
  return (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    ''
  ).trim();
}

function esFoto(msg) {
  return !!msg.message?.imageMessage;
}

/** 
* Obtiene el jid con teléfono real, contemplando la migración a LID de WhatsApp.
 * Prioriza el que termine en @s.whatsapp.net, y si ninguno lo hace, cae al remoteJid.
 */
function obtenerJidUsuario(msg) {
  const { remoteJid, remoteJidAlt } = msg.key;
  const esTelefono = (jid) => jid && jid.endsWith('@s.whatsapp.net');

  if (esTelefono(remoteJid)) return remoteJid;
  if (esTelefono(remoteJidAlt)) return remoteJidAlt;
  return remoteJid; // fallback
}

/**
 * Cancela el recordatorio pendiente de una sesión (si existe).
 */
function cancelarRecordatorio(token) {
  if (timersRecordatorio.has(token)) {
    clearTimeout(timersRecordatorio.get(token));
    timersRecordatorio.delete(token);
  }
}

/**
 * Programa un recordatorio para una sesión si no escribe en X ms.
 */
function programarRecordatorio(sock, remitente, token) {
  cancelarRecordatorio(token);

  const timer = setTimeout(async () => {
    try {
      await sock.sendMessage(remitente, {
        text: `¿Terminaste? Escribí "listo" para continuar o "saltar" para finalizar sin más fotos.`,
      });
      console.log(`⏰ Recordatorio enviado a ${token.slice(0, 8)}...`);
    } catch (err) {
      console.error('❌ Error enviando recordatorio:', err);
    }
    timersRecordatorio.delete(token);
  }, RECORDATORIO_MS);

  timersRecordatorio.set(token, timer);
}

// ============================================================
// Handler principal
// ============================================================
async function manejarMensaje(sock, msg) {
  const remitente = obtenerJidUsuario(msg); // jid con teléfono si está disponible
  const telefono = extraerTelefono(remitente);
  const texto = extraerTexto(msg);


  //console.log('🔍 msg.key completo:', JSON.stringify(msg.key, null, 2));
  console.log(`📨 jid completo: "${remitente}" | telefono: "${telefono}" | texto: "${texto}"`);
  console.log(`   tipo de mensaje: ${Object.keys(msg.message || {}).join(', ')}`);

  // 1. Pedimos al backend la sesión (crea usuario/sesión si no existe)
  const sesionData = await apiPost('/api/sesiones/desde-whatsapp', { telefono });
  console.log('🔍 Datos temporales al inicio:', sesionData.datos_temporales);

  if (!sesionData.ok) {
    console.error('❌ No se pudo obtener la sesión');
    await sock.sendMessage(msg.key.remoteJid, { text: 'Hubo un error, intentá de nuevo.' });
    return;
  }

  const token = sesionData.token;
  let estado = sesionData.estado_conversacion;

  console.log(`   → estado actual: ${estado}`);

  // 2. Procesamos según el estado
  switch (estado) {
    case 'inicio':
    case 'finalizado':
      // Arrancamos un reclamo nuevo
      await apiPost(`/api/sesiones/${token}/avanzar`, { estado: 'esperando_tipo' });
      await sock.sendMessage(msg.key.remoteJid, { text: TEXTO_TIPO });
      break;

    case 'esperando_tipo': {
      const tipo = OPCIONES_TIPO[texto];
      if (!tipo) {
        await sock.sendMessage(msg.key.remoteJid, { text: 'No entendí. Elegí 1, 2, 3 o 4.' });
        return;
      }
      await apiPost(`/api/sesiones/${token}/avanzar`, {
        estado: 'esperando_subtipo',
        datos: { tipo },
      });
      await sock.sendMessage(msg.key.remoteJid, { text: TEXTO_SUBTIPO[tipo] });
      break;
    }

    case 'esperando_subtipo': {
      // Necesitamos el tipo que ya guardó
      const datos = sesionData.datos_temporales ? JSON.parse(sesionData.datos_temporales) : {};
      const tipo = datos.tipo;
      const subtipo = OPCIONES_SUBTIPO[tipo]?.[texto];
      if (!subtipo) {
        await sock.sendMessage(msg.key.remoteJid, { text: 'No entendí. Elegí una opción válida.' });
        return;
      }
      await apiPost(`/api/sesiones/${token}/avanzar`, {
        estado: 'esperando_direccion',
        datos: { subtipo },
      });
      await sock.sendMessage(msg.key.remoteJid, { text: TEXTO_DIRECCION });
      break;
    }

    case 'esperando_direccion': {
      if (!texto) {
        await sock.sendMessage(msg.key.remoteJid, { text: 'Escribí una dirección válida.' });
        return;
      }
      await apiPost(`/api/sesiones/${token}/avanzar`, {
        estado: 'esperando_nombre',
        datos: { direccion: texto },
      });
      await sock.sendMessage(msg.key.remoteJid, { text: TEXTO_NOMBRE });
      break;
    }

    case 'esperando_nombre': {
      if (!texto) {
        await sock.sendMessage(msg.key.remoteJid, { text: 'Escribí tu nombre.' });
        return;
      }
      await apiPost(`/api/sesiones/${token}/avanzar`, {
        estado: 'esperando_foto',
        datos: { nombre: texto },
      });
      await sock.sendMessage(msg.key.remoteJid, { text: TEXTO_FOTO });
      break;
    }

    case 'esperando_foto': {
  const textoLower = texto.toLowerCase();
  const esMensajeFoto = !!msg.message?.imageMessage;

  // Recuperamos los datos temporales actuales
  const datosActuales = sesionData.datos_temporales
    ? JSON.parse(sesionData.datos_temporales)
    : {};
  const fotos = datosActuales.fotos || [];

  // --- Caso 1: llegó una foto ---
        if (esMensajeFoto) {
          if (fotos.length >= MAX_FOTOS) {
            await sock.sendMessage(remitente, {
              text: `Ya recibimos el máximo de ${MAX_FOTOS} fotos. Escribí "listo" para continuar.`,
            });
            return;
          }

          // Descargamos y guardamos la foto en disco
          const indice = fotos.length + 1;
          const rutaGuardada = await descargarYGuardarFoto(msg, token, indice);

          const nuevaFoto = {
            mensaje_id: msg.key.id,
            guardada_en: rutaGuardada,
            timestamp: Date.now(),
          };
          fotos.push(nuevaFoto);

          await apiPost(`/api/sesiones/${token}/avanzar`, {
            estado: 'esperando_foto',
            datos: { fotos },      
          });
          console.log('🔍 Mandando al backend:', JSON.stringify({ estado: 'esperando_foto', datos: { fotos } }));

          const restantes = MAX_FOTOS - fotos.length;
          if (restantes > 0) {
            await sock.sendMessage(remitente, {
              text: `📸 Foto recibida (${fotos.length}/${MAX_FOTOS}). Podés mandar ${restantes} más o escribir "listo" para continuar.`,
            });
          } else {
            await sock.sendMessage(remitente, {
              text: `📸 Foto recibida (${fotos.length}/${MAX_FOTOS}). Escribí "listo" para continuar.`,
            });
          }
          programarRecordatorio(sock, msg.key.remoteJid, token);
          return;
        }

        // --- Caso 2: el usuario escribió "listo" ---
        if (textoLower === 'listo') {
          cancelarRecordatorio(token);
          if (fotos.length === 0) {
            await sock.sendMessage(remitente, {
              text: 'Todavía no recibimos ninguna foto. Mandá una o escribí "saltar" para continuar sin fotos.',
            });
            return;
          }

          const resultado = await apiPost(`/api/sesiones/${token}/finalizar`);
          if (!resultado.ok) {
            await sock.sendMessage(remitente, { text: 'Hubo un error al guardar tu reclamo.' });
            return;
          }
          await sock.sendMessage(remitente, {
            text: `✅ Reclamo #${resultado.reclamo.id} registrado con ${fotos.length} foto(s).\nTe vamos a contactar a la brevedad.`,
          });
          return;
        }

        // --- Caso 3: el usuario escribió "saltar" ---
        if (textoLower === 'saltar' || textoLower === 'no') {
          cancelarRecordatorio(token);
          const resultado = await apiPost(`/api/sesiones/${token}/finalizar`);
          if (!resultado.ok) {
            await sock.sendMessage(remitente, { text: 'Hubo un error al guardar tu reclamo.' });
            return;
          }
          await sock.sendMessage(remitente, {
            text: `✅ Reclamo #${resultado.reclamo.id} registrado.\nTe vamos a contactar a la brevedad.`,
          });
          return;
        }

        // --- Caso 4: cualquier otra cosa ---
        await sock.sendMessage(remitente, {
          
          text: `No entendí. Mandá una foto, escribí "listo" para continuar, o "saltar" para terminar sin fotos.`,
          
        });
        cancelarRecordatorio(token);
        break;
      }

    default:
      console.warn('⚠️ Estado desconocido:', estado);
      await sock.sendMessage(msg.key.remoteJid, { text: 'Hubo un problema. Escribí "hola" para empezar.' });
  }
}

module.exports = { manejarMensaje };