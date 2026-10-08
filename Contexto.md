# CONTEXTO DEL PROYECTO

> Este archivo es un "diario de contexto" para retomar el trabajo con cualquier IA
> o después de un tiempo sin tocar el proyecto.
> Actualizarlo cada vez que se cierre una sesión importante.

---

## 📌 QUÉ ES ESTE PROYECTO

Bot de WhatsApp para gestión de reclamos de Agrotécnica Fueguina.
Reemplaza el flujo actual (mensaje automático + formulario web + operador)
por una conversación 100% por WhatsApp.

Repo: [URL de GitHub]
Última actualización: [fecha]

---

## 🚦 ESTADO ACTUAL

### ✅ Completado

- Bloque 1: entorno y estructura.
- Bloque 2: bot con Baileys.
- Bloque 3: backend + DB + tokens.
- Bloque 4: webchat (descartado como flujo principal).
- Bloque 5: flujo conversacional completo (tipo → subtipo → dirección → ubicación → nombre → fotos → confirmación).
- Cola por usuario, manejo de tipos raros, comandos de escape, timeout, recordatorios.

### ⏳ Pendiente

- Validación del flujo v1.0 con el CAO.
- Ajustes según validación.
- Implementación del nuevo flujo (reemplaza el actual).
- Bloque 6: exportación a Excel/CSV (API-first).
- TODO técnico: reemplazar `remitente` por `msg.key.remoteJid` en algunos `sendMessage`.

### 🔜 Futuro

- Bloque 7: capa de IA (Groq, como fallback inteligente).
- Bloque 8: despliegue en Oracle Cloud.
- Motor de flujos configurable (para otros bots).
- API para consumo externo (sistema actual que lee de Forms).

---

## 🧭 DECISIONES TOMADAS

- **Flujo 100% por WhatsApp**, no webchat.
- **Sin IA en v1**, para mantener determinismo.
- **SQLite** en desarrollo, migrable a PostgreSQL.
- **Selección por número** (1, 2, 3) en menús.
- **Máximo 3 fotos** por reclamo.
- **Foto opcional**, no bloquea el flujo.
- **Timeout de inactividad**: 15 minutos.
- **Expiración de sesión**: 4 horas.
- **Ubicación GPS opcional** + dirección escrita obligatoria.
- **Máximo 3 archivos** (fotos/videos) por reclamo.
- **Descripción libre mínima**: 30 caracteres.
- **Números de reclamo**: formato `2026-0001`.
- **Prioridad alta** para "Situación particular".
- **API-first** desde el principio.

---

## 🎨 FLUJO ACTUAL (v1.0, pendiente validación)

Ver archivo `FLUJO-BOT.md` (o el nombre que le hayas puesto).

Resumen:
- Menú principal: 3 opciones (reclamo, consultas, otros casos).
- Reclamo: 6 servicios, preguntas condicionales, datos mínimos.
- "Situación particular" para casos atípicos.
- Consultas informativas.
- Derivaciones a otros canales.

---

## 📋 TODOs PENDIENTES

### Alta prioridad
- [ ] Validar flujo v1.0 con CAO.
- [ ] Ajustar según validación.
- [ ] Implementar flujo nuevo en el bot.

### Media prioridad
- [ ] Reemplazar `remitente` por `msg.key.remoteJid` en `sendMessage`.
- [ ] Separar textos de la lógica (preparar para configurabilidad).
- [ ] Documentar endpoints en README.

### Baja prioridad
- [ ] Bloque 6: exportación a Excel.
- [ ] API key para consumo externo.
- [ ] Notificaciones al CAO para prioridad alta.

---

## 🗣️ ÚLTIMA CHARLA (resumen)

**Fecha**: 2026-10-08
**Temas tratados**:
- Diseño completo del nuevo flujo del bot (basado en relevamiento del CAO).
- Decisión de "Situación particular" para casos atípicos.
- Estrategias para adaptar el bot a otros contextos (copiar, configurar, motor de flujos).
- Propuesta de `CONTEXTO.md` para retomar la charla.

**Acuerdos**:
- El flujo v1.0 está listo para validación.
- Después de la validación, se implementa.
- Estrategia a futuro: no abstraer hasta tener 3 casos.

---

## 🔄 CÓMO RETOMAR

Si volvés después de un tiempo, decile a la IA algo así:

> "Leé el CONTEXTO.md del proyecto. Estamos en [bloque/paso].
> Última sesión hicimos [X]. Ahora quiero [Y]."

O simplemente:

> "Leé el CONTEXTO.md y decime dónde estamos."

Y con eso, la IA retoma el hilo.

---

## 📅 HISTORIAL DE SESIONES

### 2026-10-08
- Diseño del flujo v1.0.
- Discusión sobre adaptabilidad del bot.

### 2026-10-07
- Diseño del flujo (primera parte).
- Decisión de "Situación particular".

### 2026-10-05
- TODO 3: `msg.key.remoteJid` en respuestas.
- Cierre oficial del Bloque 5.

### 2026-10-04
- TODO 1: cola por usuario.
- TODO 2: ignorar mensajes sin contenido.
- Bug fixing de fotos.

INSTRUCCIONES PARA LA IA QUE LEA ESTE ARCHIVO:

1. Leé todo el archivo antes de responder.
2. Fijate en la sección "CÓMO RETOMAR" para entender el estado actual.
3. Si el usuario pide algo, revisá primero si ya está en TODOs.
4. Si falta contexto, preguntá antes de asumir.
5. Actualizá este archivo al final de cada sesión.