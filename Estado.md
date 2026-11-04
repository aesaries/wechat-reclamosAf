# ESTADO DEL PROYECTO

Última actualización: 2026-11-04

## ✅ Completado

- [x] Estructura de carpetas del bot modular.
- [x] Helpers en `compartido/` (api, texto, fotos, ubicacion, recordatorios, comandos).
- [x] `menu.js` con las 3 opciones conectadas a los flujos.
- [x] `reclamo.js` con flujo completo (6 servicios, foto/ubicación obligatorias con escape).
- [x] `consultas.js` con 4 servicios informativos.
- [x] `otrosCasos.js` con 6 derivaciones.
- [x] `mensajes.js` como enrutador principal.
- [x] DB con columnas nuevas (`numero_reclamo`, `prioridad`, `tiene_foto`, `sin_foto`, `tiene_ubicacion`, `sin_ubicacion`, `motivo_*`).

## 🚧 En progreso

- [ ] Fix del endpoint `/:token/finalizar` para el flujo v2.0.

## ⏳ Pendiente

- [ ] Probar flujo completo de punta a punta (13 casos del checklist).
- [ ] Bloque 6: exportación a Excel/CSV.
- [ ] Bloque 7: capa de IA.
- [ ] Bloque 8: deploy en Oracle Cloud.

## 📌 Próximo paso concreto

Reescribir `/:token/finalizar` en `backend/rutas/sesiones.js` para:
1. Leer datos del flujo v2.0 (`servicio`, `acondicionamiento`, `volumen`, `cuando`, `barrio`, `direccion`, etc.).
2. Generar `numero_reclamo` (`2026-0001`).
3. Guardar `prioridad` (alta si `servicio === 'situacion_particular'`).
4. Guardar `tiene_foto`, `sin_foto`, `motivo_sin_foto`, `tiene_ubicacion`, `sin_ubicacion`, `motivo_sin_ubicacion`.
5. Devolver el reclamo con `numero_reclamo`.