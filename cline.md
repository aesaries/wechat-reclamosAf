# AGENTS.md — Bot de Reclamos Agrotécnica Fueguina

## Project Overview
Bot de WhatsApp (Baileys) + Backend Express/SQLite para gestión de reclamos.
El flujo conversacional está validado (v2.0). La implementación está completa
en `bot/handlers/`, pero hay un bug pendiente en el endpoint `/finalizar`
del backend.

## Comandos Esenciales
- **Backend**: `node backend/index.js` (desde la raíz del proyecto, NO desde `backend/`)
- **Bot**: `node bot/index.js` (desde la raíz, NO desde `bot/`)
- **DB**: SQLite en `database/reclamos.sqlite`. Borrar el archivo recrea el esquema.

## Estructura Crítica
- `bot/handlers/mensajes.js`: Enrutador principal. Lee `estado_conversacion` y deriva.
- `bot/handlers/compartido/`: Helpers (api, texto, fotos, ubicacion, recordatorios, comandos).
- `bot/handlers/reclamo.js`: Flujo de reclamo completo (el más grande).
- `bot/handlers/menu.js`: Menú principal.
- `backend/rutas/sesiones.js`: Endpoints de sesión. **El endpoint `/:token/finalizar` tiene un bug conocido: no está adaptado al flujo v2.0.**

## Convenciones y Reglas
- **No tocar `bot/auth/`**: credenciales de WhatsApp. Ignorar.
- **No tocar `uploads/`**: fotos de usuarios. Ignorar.
- **Textos**: Viven en constantes dentro de cada archivo de flujo. No hardcodear en el enrutador.
- **Estados**: El estado de la conversación vive en `sesiones.estado_conversacion`. Cada flujo maneja sus estados.
- **Escape de foto/ubicación**: El bot debe permitir "no puedo" para avanzar sin bloquear.

## Pendientes (Prioridad)
1. **Fix `/finalizar`**: Adaptar el endpoint para leer `servicio` (no `tipo`), generar `numero_reclamo` (formato 2026-0001), y guardar `prioridad`, `tiene_foto`, `sin_foto`, etc.
2. **Probar flujo completo** de punta a punta tras el fix.
3. **Bloque 6**: Exportación a Excel (API-first).

## Qué NO hacer
- No renombrar `mensajes-old.js` (es referencia).
- No modificar el esquema de la DB sin avisar.
- No cambiar la lógica de la cola por usuario en `bot/index.js`.