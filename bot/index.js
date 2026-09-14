// bot/index.js
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const path = require('path');
const { manejarMensaje } = require('./handlers/mensajes');

const AUTH_DIR = path.join(__dirname, 'auth');

async function iniciarBot() {
  // 1. Cargamos (o creamos) el estado de autenticación
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  // 2. Creamos el socket de WhatsApp
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, // lo mostramos nosotros a mano
    browser: ['Chatboot Reclamos', 'Chrome', '1.0.0'],
  });

  // 3. Cuando cambian las credenciales, las guardamos
  sock.ev.on('creds.update', saveCreds);

  // 4. Manejo de la conexión
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n📱 Escaneá este QR con WhatsApp (Dispositivos vinculados):\n');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const debeReconectar = statusCode !== DisconnectReason.loggedOut;

      console.log('🔌 Conexión cerrada. Código:', statusCode);
      console.log('   ¿Reconectar?', debeReconectar);

      if (debeReconectar) {
        iniciarBot(); // reintentamos
      } else {
        console.log('❌ Sesión cerrada. Borrá la carpeta bot/auth y volvé a empezar.');
      }
    }

    if (connection === 'open') {
      console.log('✅ Bot conectado a WhatsApp correctamente.');
    }
  });

  // 5. Escuchamos mensajes entrantes
  sock.ev.on('messages.upsert', async (evento) => {
    const mensajes = evento.messages;
    for (const msg of mensajes) {
      // Ignoramos mensajes que no son nuevos o que manda el propio bot
      if (!msg.message || msg.key.fromMe) continue;

      try {
        await manejarMensaje(sock, msg);
      } catch (err) {
        console.error('❌ Error manejando mensaje:', err);
      }
    }
  });

  return sock;
}

iniciarBot();