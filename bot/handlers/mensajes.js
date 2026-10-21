// bot/handlers/mensajes.js
const { apiPost } = require("./compartido/api");
const {
  extraerTelefono,
  extraerTexto,
  obtenerJidUsuario,
  detectarMensajeNoSoportado,
  mensajeNoSoportado,
} = require("./compartido/texto");
const {
  esSaludo,
  esCancelar,
  esAyuda,
  TEXTO_AYUDA,
  TEXTO_CANCELADO,
} = require("./compartido/comandos");
const { cancelarRecordatorio } = require("./compartido/recordatorios");
const { manejarMenu, TEXTO_BIENVENIDA } = require("./menu");
const { manejarReclamo, TEXTO_SERVICIO } = require("./reclamo");
const { manejarConsulta, TEXTO_CONSULTA_SERVICIO } = require("./consultas");
const { manejarOtrosCasos, TEXTO_OTROS_CASO } = require("./otrosCasos");

// ============================================================
// HANDLER PRINCIPAL
// ============================================================

async function manejarMensaje(sock, msg) {
  const remitente = obtenerJidUsuario(msg);
  const telefono = extraerTelefono(remitente);
  const texto = extraerTexto(msg);
  const tipoNoSoportado = detectarMensajeNoSoportado(msg);

  console.log(
    `📨 jid: "${msg.key.remoteJid}" | alt: "${msg.key.remoteJidAlt}" | telefono: "${telefono}" | texto: "${texto}"`,
  );
  console.log(`   tipo: ${Object.keys(msg.message || {}).join(", ")}`);

  // 1. Detectar mensajes no soportados
  if (tipoNoSoportado === "ignorar") return;
  if (tipoNoSoportado) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: mensajeNoSoportado(tipoNoSoportado),
    });
    return;
  }

  // 2. Obtener sesión del backend
  const sesionData = await apiPost("/api/sesiones/desde-whatsapp", {
    telefono,
  });

  if (!sesionData.ok) {
    console.error("❌ No se pudo obtener la sesión");
    await sock.sendMessage(msg.key.remoteJid, {
      text: "Hubo un error, intentá de nuevo.",
    });
    return;
  }

  const token = sesionData.token;
  let estado = sesionData.estado_conversacion;

  console.log(`   → estado actual: ${estado}`);

  // 3. Comandos globales (aplican en cualquier estado)
  if (esCancelar(texto)) {
    cancelarRecordatorio(token);
    await apiPost(`/api/sesiones/${token}/avanzar`, {
      estado: "inicio",
      datos: {},
    });
    await sock.sendMessage(msg.key.remoteJid, { text: TEXTO_CANCELADO });
    return;
  }

  if (esAyuda(texto)) {
    await sock.sendMessage(msg.key.remoteJid, { text: TEXTO_AYUDA });
    return;
  }

  if (esSaludo(texto)) {
    cancelarRecordatorio(token);
    await apiPost(`/api/sesiones/${token}/avanzar`, {
      estado: "esperando_menu",
      datos: {},
    });
    await sock.sendMessage(msg.key.remoteJid, { text: TEXTO_BIENVENIDA });
    return;
  }

  // 4. Enrutar según el estado
  if (estado === "inicio" || estado === "esperando_menu") {
    await manejarMenu(sock, msg, token, estado, texto);
    return;
  }

  if (
    estado.startsWith("esperando_reclamo") ||
    estado === "esperando_servicio" ||
    estado.startsWith("esperando_acondicionamiento") ||
    estado === "esperando_volumen" ||
    estado === "esperando_descripcion_particular" ||
    estado === "esperando_cuando" ||
    estado === "esperando_barrio" ||
    estado === "esperando_direccion" ||
    estado === "esperando_direccion_detallada" ||
    estado === "esperando_ubicacion" ||
    estado === "esperando_ubicacion_escape_confirmacion" ||
    estado === "esperando_foto" ||
    estado === "esperando_foto_escape_confirmacion" ||
    estado === "esperando_nombre" ||
    estado === "esperando_comentarios" ||
    estado === "esperando_aceptacion_terminos"
  ) {
    await manejarReclamo(sock, msg, token, estado, texto, sesionData);
    return;
  }

  if (
    estado === "esperando_consulta_servicio" ||
    estado === "esperando_consulta_cierre"
  ) {
    await manejarConsulta(sock, msg, token, estado, texto);
    return;
  }

  if (
    estado === "esperando_otros_caso" ||
    estado === "esperando_otros_cierre"
  ) {
    await manejarOtrosCasos(sock, msg, token, estado, texto);
    return;
  }

  // 5. Estado desconocido o finalizado
  if (estado === "finalizado") {
    await manejarMenu(sock, msg, token, "inicio", texto);
    return;
  }

  console.warn("⚠️ Estado no manejado:", estado);
  await sock.sendMessage(msg.key.remoteJid, {
    text: 'Hubo un problema. Escribí "hola" para volver al menú.',
  });
}

module.exports = { manejarMensaje };
