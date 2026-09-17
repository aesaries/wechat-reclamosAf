// frontend/public/chat.js

const estadoDiv = document.getElementById('estado');
const form = document.getElementById('formReclamo');
const selectTipo = document.getElementById('tipo');
const selectSubtipo = document.getElementById('subtipo');

// Token de la URL
const params = new URLSearchParams(window.location.search);
const token = params.get('token');

// Opciones de subtipo según el tipo elegido
const SUBTIPOS = {
  residuos: [
    { value: 'no_levantan', label: 'No levantan la basura' },
    { value: 'contenedor_desbordado', label: 'Contenedor desbordado' },
    { value: 'fuera_de_horario', label: 'Recolección fuera de horario' },
  ],
  poda: [
    { value: 'no_acondicionada', label: 'Poda no acondicionada (no está atada)' },
    { value: 'supera_1m3', label: 'Supera 1 m³' },
    { value: 'no_retirada', label: 'Poda acondicionada pero no retirada' },
  ],
  escombros: [
    { value: 'via_publica', label: 'Escombro en la vía pública' },
    { value: 'sin_autorizacion', label: 'Escombro sin autorización' },
  ],
  otro: [
    { value: 'otro', label: 'Otro (describir en comentarios)' },
  ],
};

function mostrarEstado(mensaje, tipo) {
  estadoDiv.textContent = mensaje;
  estadoDiv.className = `estado ${tipo}`;
}

function actualizarSubtipos() {
  const tipo = selectTipo.value;
  selectSubtipo.innerHTML = '';

  if (!tipo) {
    selectSubtipo.innerHTML = '<option value="">Elegí primero el tipo...</option>';
    return;
  }

  const opciones = SUBTIPOS[tipo] || [];
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Elegí una opción...';
  selectSubtipo.appendChild(placeholder);

  opciones.forEach(op => {
    const opt = document.createElement('option');
    opt.value = op.value;
    opt.textContent = op.label;
    selectSubtipo.appendChild(opt);
  });
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

    // Token válido: ocultamos el estado y mostramos el formulario
    estadoDiv.classList.add('oculto');
    form.classList.remove('oculto');

    // Si el usuario ya tiene nombre guardado, lo precargamos
    if (datos.sesion?.nombre) {
      document.getElementById('nombre').value = datos.sesion.nombre;
    }
  } catch (err) {
    console.error(err);
    mostrarEstado('❌ No pudimos validar el enlace. Probá de nuevo en un rato.', 'error');
  }
}

selectTipo.addEventListener('change', actualizarSubtipos);

validarToken();

// --- Envío del formulario ---

form.addEventListener('submit', async (evento) => {
  evento.preventDefault(); // evitamos que la página se recargue

  const btn = document.getElementById('btnEnviar');
  btn.disabled = true;
  btn.textContent = 'Enviando...';

  const datos = {
    token: token,
    tipo: selectTipo.value,
    subtipo: selectSubtipo.value,
    direccion: document.getElementById('direccion').value.trim(),
    nombre: document.getElementById('nombre').value.trim(),
    detalle: document.getElementById('detalle').value.trim() || null,
  };

  try {
    const resp = await fetch('/api/reclamos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });

    const resultado = await resp.json();

    if (!resp.ok || !resultado.ok) {
      throw new Error(resultado.error || 'No se pudo enviar el reclamo');
    }

    // Éxito: mostramos confirmación y ocultamos el formulario
    form.classList.add('oculto');
    estadoDiv.classList.remove('oculto');
    estadoDiv.className = 'estado ok';
    estadoDiv.innerHTML = `
      ✅ <strong>¡Reclamo enviado!</strong><br>
      Guardamos tu reclamo. Te vamos a contactar por WhatsApp a la brevedad.<br>
      <small>Número de reclamo: #${resultado.reclamo.id}</small>
    `;
  } catch (err) {
    console.error(err);
    btn.disabled = false;
    btn.textContent = 'Enviar reclamo';
    alert('Hubo un problema al enviar tu reclamo: ' + err.message);
  }
});