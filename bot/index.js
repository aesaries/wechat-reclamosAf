// bot/index.js
require("dotenv").config();

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const path = require("path");
const { manejarMensaje } = require("./handlers/mensajes");
const colaPorUsuario = new Map();

const AUTH_DIR = path.join(__dirname, "auth");

async function iniciarBot() {
  // 1. Cargamos (o creamos) el estado de autenticación
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  // 2. Creamos el socket de WhatsApp
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, // lo mostramos nosotros a mano
    browser: ["Chatboot Reclamos", "Chrome", "1.0.0"],
  });

  // 3. Cuando cambian las credenciales, las guardamos
  sock.ev.on("creds.update", saveCreds);

  // 4. Manejo de la conexión
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(
        "\n📱 Escaneá este QR con WhatsApp (Dispositivos vinculados):\n",
      );
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const debeReconectar = statusCode !== DisconnectReason.loggedOut;

      console.log("🔌 Conexión cerrada. Código:", statusCode);
      console.log("   ¿Reconectar?", debeReconectar);

      if (debeReconectar) {
        iniciarBot(); // reintentamos
      } else {
        console.log(
          "❌ Sesión cerrada. Borrá la carpeta bot/auth y volvé a empezar.",
        );
      }
    }

    if (connection === "open") {
      console.log("✅ Bot conectado a WhatsApp correctamente.");
    }
  });

  // 5. Escuchamos mensajes entrantes

  function procesarEnCola(usuarioId, tarea) {
    const anterior = colaPorUsuario.get(usuarioId) || Promise.resolve();
    const nueva = anterior
      .then(() => tarea())
      .catch((err) => console.error("❌ Error en cola:", err));

    colaPorUsuario.set(usuarioId, nueva);

    nueva.finally(() => {
      if (colaPorUsuario.get(usuarioId) === nueva) {
        colaPorUsuario.delete(usuarioId);
      }
    });
  }

  sock.ev.on("messages.upsert", async (evento) => {
    const mensajes = evento.messages;
    for (const msg of mensajes) {
      if (!msg.message || msg.key.fromMe) continue;

      // Usamos el jid como clave de usuario
      const usuarioId = msg.key.remoteJid;

      // Encolamos el procesamiento
      procesarEnCola(usuarioId, () => manejarMensaje(sock, msg));
    }
  });

  return sock;
}

iniciarBot();
