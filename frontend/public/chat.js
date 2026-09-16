// frontend/public/chat.js

const estadoDiv = document.getElementById('estado');

// Leemos el token de la URL: chat.html?token=XXXX
const params = new URLSearchParams(window.location.search);
const token = params.get('token');

function mostrarEstado(mensaje, tipo) {
  estadoDiv.textContent = mensaje;
  estadoDiv.className = `estado ${tipo}`;
}

async function validarToken() {
  if (!token) {
    mostrarEstado('❌ Falta el token en el enlace. Pedilo de nuevo por WhatsApp.', 'error');
    return;
  }

  try {
    const resp = await fetch(`/api/sesiones/validar/${token}`);
    const datos = await resp.json();

    if (!resp.ok || !datos.ok) {
      mostrarEstado('❌ El enlace expiró o no es válido. Pedí uno nuevo por WhatsApp.', 'error');
      return;
    }

    // Token válido: mostramos bienvenida (por ahora, sin formulario)
    mostrarEstado(
      `✅ ¡Hola! Enlace válido. En el próximo paso vas a poder cargar tu reclamo acá.`,
      'ok'
    );

    console.log('Sesión:', datos.sesion);
  } catch (err) {
    console.error(err);
    mostrarEstado('❌ No pudimos validar el enlace. Probá de nuevo en un rato.', 'error');
  }
}
validarToken();