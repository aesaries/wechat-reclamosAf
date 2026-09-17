// bot/handlers/mensajes.js

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
const TEXTO_FOTO = `¿Querés mandar una foto del problema? (opcional)

Mandá la foto, o escribí "saltar" para continuar.`;

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

// ============================================================
// Handler principal
// ============================================================
async function manejarMensaje(sock, msg) {
  const remitente = msg.key.remoteJid;
  const telefono = extraerTelefono(remitente);
  const texto = extraerTexto(msg);

  console.log(`📨 [${telefono}] estado recibido, texto: "${texto}"`);

  // 1. Pedimos al backend la sesión (crea usuario/sesión si no existe)
  const sesionData = await apiPost('/api/sesiones/desde-whatsapp', { telefono });
  if (!sesionData.ok) {
    console.error('❌ No se pudo obtener la sesión');
    await sock.sendMessage(remitente, { text: 'Hubo un error, intentá de nuevo.' });
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
      await sock.sendMessage(remitente, { text: TEXTO_TIPO });
      break;

    case 'esperando_tipo': {
      const tipo = OPCIONES_TIPO[texto];
      if (!tipo) {
        await sock.sendMessage(remitente, { text: 'No entendí. Elegí 1, 2, 3 o 4.' });
        return;
      }
      await apiPost(`/api/sesiones/${token}/avanzar`, {
        estado: 'esperando_subtipo',
        datos: { tipo },
      });
      await sock.sendMessage(remitente, { text: TEXTO_SUBTIPO[tipo] });
      break;
    }

    case 'esperando_subtipo': {
      // Necesitamos el tipo que ya guardó
      const datos = sesionData.datos_temporales ? JSON.parse(sesionData.datos_temporales) : {};
      const tipo = datos.tipo;
      const subtipo = OPCIONES_SUBTIPO[tipo]?.[texto];
      if (!subtipo) {
        await sock.sendMessage(remitente, { text: 'No entendí. Elegí una opción válida.' });
        return;
      }
      await apiPost(`/api/sesiones/${token}/avanzar`, {
        estado: 'esperando_direccion',
        datos: { subtipo },
      });
      await sock.sendMessage(remitente, { text: TEXTO_DIRECCION });
      break;
    }

    case 'esperando_direccion': {
      if (!texto) {
        await sock.sendMessage(remitente, { text: 'Escribí una dirección válida.' });
        return;
      }
      await apiPost(`/api/sesiones/${token}/avanzar`, {
        estado: 'esperando_nombre',
        datos: { direccion: texto },
      });
      await sock.sendMessage(remitente, { text: TEXTO_NOMBRE });
      break;
    }

    case 'esperando_nombre': {
      if (!texto) {
        await sock.sendMessage(remitente, { text: 'Escribí tu nombre.' });
        return;
      }
      await apiPost(`/api/sesiones/${token}/avanzar`, {
        estado: 'esperando_foto',
        datos: { nombre: texto },
      });
      await sock.sendMessage(remitente, { text: TEXTO_FOTO });
      break;
    }

    case 'esperando_foto': {
      // Por ahora no procesamos la foto, solo avanzamos
      const textoLower = texto.toLowerCase();
      if (textoLower !== 'saltar' && textoLower !== 'no') {
        await sock.sendMessage(remitente, {
          text: 'Por ahora no procesamos fotos. Escribí "saltar" para continuar.',
        });
        return;
      }
      // Finalizamos
      const resultado = await apiPost(`/api/sesiones/${token}/finalizar`);
      if (!resultado.ok) {
        await sock.sendMessage(remitente, { text: 'Hubo un error al guardar tu reclamo.' });
        return;
      }
      await sock.sendMessage(remitente, {
        text: `✅ Reclamo #${resultado.reclamo.id} registrado.\nTe vamos a contactar a la brevedad.`,
      });
      break;
    }

    default:
      console.warn('⚠️ Estado desconocido:', estado);
      await sock.sendMessage(remitente, { text: 'Hubo un problema. Escribí "hola" para empezar.' });
  }
}

module.exports = { manejarMensaje };