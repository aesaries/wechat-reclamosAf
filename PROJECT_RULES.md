# Reglas Generales del Proyecto (PROJECT_RULES.md)

## 🔄 Protocolos de Memoria y Continuidad

1. **Protocolo de Inicio de Chat:**
   - En cada nuevo chat o tarea, la IA debe consultar primero
     `PROJECT_RULES.md`, `CONTEXTO.md`, `ESTADO.md`, `FLUJO-BOT.md`
     y el `README.md` para ponerse al día.
   - Si algún archivo no existe, debe preguntar antes de asumir.

2. **Protocolo de Cierre de Tarea (OBLIGATORIO):**
   - Al finalizar cualquier paso, hito o función funcional, la IA **debe
     actualizar `ESTADO.md`**:
     - Marcar casilleros correspondientes con `[x]`.
     - Actualizar la fecha de `Última actualización`.
     - Detallar explícitamente qué paso o fase sigue.
   - Si el paso cambió el flujo o agregó una decisión, también debe
     actualizar `CONTEXTO.md` y, si corresponde, `FLUJO-BOT.md`.

3. **Registro de Decisiones (ADR):**
   - Si se acuerda una nueva decisión de diseño, cambio de flujo o
     regla de negocio, la IA **debe registrarla inmediatamente en
     `CONTEXTO.md`** en la sección de decisiones tomadas.

## 🛠️ Cómo Trabajar

- Respondé siempre en español.
- Trabajá **un paso por vez**. No adelantes código de pasos siguientes.
- Esperá confirmación del usuario después de cada paso.
- Si algo es ambiguo o falta información, preguntá antes de asumir.
- Antes de modificar un archivo, **leelo completo** y confirmá que
  entendés su rol en la arquitectura.
- Si un cambio afecta a más de un archivo, listalos antes de empezar.

## 📦 Entrega de Código

- Entrega el código completo de cada archivo con su ruta exacta.
- Para scripts Node, indica la ruta dentro del proyecto.
- Para SQL, entrega el bloque listo para ejecutar (SQLite).
- Explicá siempre cómo probar lo implementado y qué resultado esperar.
- Si se requiere reiniciar el backend o el bot, decilo explícitamente.
- Recordá: **backend y bot se corren desde la raíz del proyecto**,
  NO desde subcarpetas (por `dotenv`).

## 💻 Estilo de Código y Stack

- **JavaScript puro** (sin TypeScript).
- **Node.js v22**.
- **CommonsJS** (`require` / `module.exports`), no ESM.
- **Baileys** (`@whiskeysockets/baileys`) para WhatsApp.
- **Express** para el backend.
- **SQLite** con `better-sqlite3`.
- **Sin frameworks de frontend** (el panel futuro será vanilla o mínimo).
- Nombres de funciones y variables en **camelCase**.
- Nombres de archivos en **camelCase** para módulos, **kebab-case**
  para los `.md`.
- Comentarios en español, concisos, solo cuando aportan.
- **No usar `var`**. Usar `const` por defecto, `let` solo si se
  reasigna.
- **No usar `async/await` sin try/catch** en llamadas externas
  (backend, Baileys).

## 🗂️ Arquitectura del Proyecto
Chatboot/
├── bot/ # Bot de WhatsApp
│ ├── index.js # Conexión Baileys + cola por usuario
│ ├── auth/ # ⚠️ NO TOCAR - credenciales
│ └── handlers/
│ ├── mensajes.js # Enrutador principal
│ ├── mensajes-old.js # ⚠️ Referencia, NO modificar
│ ├── menu.js # Menú principal
│ ├── reclamo.js # Flujo de reclamo completo
│ ├── consultas.js # Flujo de consultas
│ ├── otrosCasos.js # Flujo de derivaciones
│ └── compartido/ # Helpers reutilizables
│ ├── api.js
│ ├── texto.js
│ ├── fotos.js
│ ├── ubicacion.js
│ ├── recordatorios.js
│ └── comandos.js
├── backend/ # API REST
│ ├── index.js # Servidor Express
│ ├── db.js # Conexión y esquema SQLite
│ ├── rutas/
│ │ ├── sesiones.js # Sesiones y avance del flujo
│ │ └── reclamos.js # Reclamos
│ └── utils/
│ └── tokens.js
├── database/
│ └── reclamos.sqlite # ⚠️ Borrar recrea esquema
├── uploads/ # ⚠️ NO TOCAR - fotos de usuarios
├── .env # ⚠️ NO TOCAR - secretos
└── *.md # Documentación


## 🔒 Seguridad y Base de Datos

- **NUNCA** commitear `.env`, `bot/auth/`, `database/*.sqlite`,
  `uploads/`.
- **NUNCA** loguear tokens, contraseñas ni datos sensibles.
- Los mensajes de WhatsApp no se loguean completos: solo jid,
  teléfono y texto (ya está implementado así).
- Las fotos se guardan en `uploads/` con nombre único
  (`{token}_{timestamp}_{indice}.{ext}`).
- **No se eliminan reclamos físicamente**: se usa estado
  `cancelado` o se mantienen para auditoría.
- Los endpoints del backend **no tienen autenticación todavía**.
  No exponer a internet sin agregar API key (TODO futuro).

## 📌 Datos y Entornos

- Ruta local: `D:/APP/Chatboot/`
- Backend corre en `http://localhost:3000`
- Bot se conecta a WhatsApp vía Baileys (QR en primera ejecución)
- Base de datos: SQLite en `database/reclamos.sqlite`
- Variables de entorno en `.env`:
  - `NODE_ENV`, `PORT`, `DB_PATH`
  - `BACKEND_URL`, `WEBCHAT_URL` (legacy)
  - `SESSION_SECRET` (legacy)

## 🚨 Reglas Específicas del Bot

1. **Cola por usuario**: cada mensaje de un mismo usuario se procesa
   en orden (`bot/index.js`). **No romper esta lógica.**
2. **Identificación de usuario**: usar `obtenerJidUsuario(msg)` de
   `compartido/texto.js`. Resuelve el LID vs teléfono real.
3. **Respuestas**: siempre a `msg.key.remoteJid` (el original), NUNCA
   a `remitente` (que puede ser el alt).
4. **Timeouts**: 15 min de inactividad resetea el estado a `inicio`.
   4 hs de expiración de sesión.
5. **Recordatorios**: 30 seg para fotos, 60 seg para campos
   obligatorios. Un solo timer por sesión.
6. **Escapes**: "no puedo", "no me deja", "no sé cómo", "no tengo",
   "no se puede", "no funciona", "sin foto", "sin ubicación".
   Confirmación: "sí", "dale", "ok", "1".
7. **Comandos globales**: "hola" (menú), "cancelar" (reset),
   "ayuda" (texto). Aplican en cualquier estado.
8. **Mensajes no soportados** (audio, video, sticker, etc.): responder
   con texto claro, NO avanzar el flujo.

## 📋 Pendientes Conocidos (Prioridad)

1. **🔴 Bug crítico**: endpoint `/:token/finalizar` en
   `backend/rutas/sesiones.js` no está adaptado al flujo v2.0.
   - No lee `servicio` (usa `tipo` viejo).
   - No genera `numero_reclamo` (formato `2026-0001`).
   - No guarda `prioridad`, `tiene_foto`, `sin_foto`,
     `tiene_ubicacion`, `sin_ubicacion`, `motivo_*`.
   - **Consecuencia**: al confirmar un reclamo, el bot muestra
     "Hubo un error al guardar tu reclamo".

2. **Bloque 6**: exportación a Excel/CSV (API-first).

3. **Bloque 7**: capa de IA como fallback (Groq u otro).

4. **Bloque 8**: despliegue en Oracle Cloud Free Tier.

## 🎯 Qué NO Hacer

- No renombrar `mensajes-old.js` (es referencia).
- No modificar `bot/auth/`, `uploads/`, `.env`.
- No cambiar el esquema de la DB sin avisar.
- No cambiar la lógica de la cola por usuario.
- No cambiar la lógica de `obtenerJidUsuario`.
- No hardcodear textos en el enrutador: van en cada flujo.
- No agregar dependencias sin justificar y preguntar.

## 🧪 Cómo Probar Cada Cambio

1. **Backend**: `node backend/index.js` (desde la raíz).
2. **Bot**: `node bot/index.js` (desde la raíz).
3. **Mandar mensaje** al WhatsApp del bot.
4. **Verificar**:
   - Respuesta correcta en WhatsApp.
   - Log en consola del bot.
   - Estado en DB (`sesiones.estado_conversacion`,
     `sesiones.datos_temporales`).
   - Si aplica, fila en `reclamos` con los datos correctos.

Si algo falla, **pegar log del bot + log del backend + estado de la
DB** antes de proponer un fix.