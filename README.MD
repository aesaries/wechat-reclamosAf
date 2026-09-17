# Chatboot Reclamos

Sistema de gestión de reclamos vía WhatsApp con flujo conversacional,
panel de administración y reportes para planificación de servicios.

## 🎯 Objetivo del proyecto

Permitir que los vecinos/usuarios reporten problemas (residuos, poda,
escombros, otros) directamente por WhatsApp, mediante una conversación
guiada. Los reclamos se guardan en una base de datos, se verifican, se
asignan a servicios, y se reportan para planificación.

Nace como proyecto de práctica, con intención de escalar a uso real en
la empresa.

## 🏗️ Arquitectura

- **Bot**: recibe mensajes, consulta el estado de la conversación, y
  avanza el flujo paso a paso (tipo → subtipo → dirección → nombre → foto).
- **Backend**: API REST que expone endpoints para gestionar sesiones,
  reclamos, usuarios y (a futuro) reportes.
- **Base de datos**: SQLite (para práctica). Migrable a PostgreSQL
  cuando el volumen lo requiera.
- **Panel**: interfaz web para que el agente verifique reclamos, los
  asigne a servicios, y para que los servicios vean su planilla de trabajo.

## 📁 Estructura del proyecto

Chatboot/
├── bot/ # Bot de WhatsApp (Baileys)
│ ├── index.js # Conexión a WhatsApp, manejo de eventos
│ ├── auth/ # Credenciales de sesión (NO subir a Git)
│ └── handlers/
│ └── mensajes.js # Máquina de estados del flujo conversacional
├── backend/ # API REST (Node.js + Express)
│ ├── index.js # Servidor Express
│ ├── db.js # Conexión y esquema de SQLite
│ ├── rutas/
│ │ ├── sesiones.js # Endpoints de sesión y avance del flujo
│ │ └── reclamos.js # Endpoints de reclamos
│ └── utils/
│ └── tokens.js # Generación de tokens seguros
├── frontend/ # (Reservado para el panel de gestión)
│ └── public/
├── database/ # Base de datos SQLite
│ └── reclamos.sqlite
├── uploads/ # Fotos adjuntas a reclamos (a futuro)
├── .env # Variables de entorno (NO subir a Git)
├── .gitignore
├── package.json
└── README.md
text


## 🚦 Estado actual

### ✅ Completado

- **Bloque 1** — Entorno, estructura del proyecto, Node.js + npm + dotenv.
- **Bloque 2** — Bot de WhatsApp con Baileys. Conexión por QR,
  persistencia de sesión, recepción y envío de mensajes.
- **Bloque 3** — Backend Express, base de datos SQLite, generación de
  tokens seguros, endpoints de sesión.
- **Bloque 4** — Webchat con validación de token y formulario (descartado
  como flujo principal, pero la base quedó).
- **Bloque 5** — Flujo conversacional completo por WhatsApp:
  - Estados: `inicio`, `esperando_tipo`, `esperando_subtipo`,
    `esperando_direccion`, `esperando_nombre`, `esperando_foto`, `finalizado`.
  - Datos temporales acumulados en `sesiones.datos_temporales`.
  - Al finalizar, se crea el reclamo en la DB y se actualiza el usuario.

### ⏳ Pendiente

- **Paso 5.5** — Soporte de fotos: recibir imágenes por WhatsApp,
  descargarlas con Baileys, guardarlas en `uploads/`, asociarlas al reclamo.

### 🔜 Próximos bloques

- **Bloque 6** — Panel de gestión y reportes:
  - **6.1** — Autenticación del agente (login simple).
  - **6.2** — Bandeja de reclamos entrantes (ver, aprobar, rechazar,
    asignar servicio).
  - **6.3** — Vista por servicio (planilla de trabajo mobile-friendly).
  - **6.4** — Comunicación agente ↔ usuario (responder por WhatsApp
    desde el panel).
  - **6.5** — Reportes y estadísticas (con exportación a CSV).
  - **6.6** — Gestión de servicios (alta/baja de servicios, usuarios
    por servicio).

### 🧠 Bloque 7 — Capa de IA conversacional (futuro)

Agregar IA como **fallback inteligente**, sin romper el flujo determinístico.

- IA como traductor de intenciones (lenguaje natural → opción del menú).
- IA para responder dudas libres simples.
- Reglas: la IA no crea ni cancela reclamos, no decide sola, siempre
  deriva a humano ante dudas.
- Herramientas candidatas (gratis): Groq, Google AI Studio, Ollama local.

### ☁️ Bloque 8 — Despliegue

- Migrar de la PC local a un servidor en la nube.
- Opción recomendada: Oracle Cloud Free Tier (VM ARM, gratis para siempre).
- HTTPS obligatorio para fotos y ubicación.
- Migración de SQLite a PostgreSQL si el volumen lo requiere.

## 🗄️ Modelo de datos

### `usuarios`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | |
| telefono | TEXT UNIQUE | Número de WhatsApp |
| nombre | TEXT | Nombre del usuario |
| direccion | TEXT | Última dirección reportada |
| creado_en | DATETIME | |

### `sesiones`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | |
| token | TEXT UNIQUE | Token seguro de sesión |
| usuario_id | INTEGER FK | |
| activa | INTEGER | 1 = activa, 0 = cerrada |
| expira_en | DATETIME | Expiración (24 hs por defecto) |
| estado_conversacion | TEXT | Estado del flujo |
| datos_temporales | TEXT | JSON con datos acumulados |
| creado_en | DATETIME | |

### `reclamos`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | |
| usuario_id | INTEGER FK | |
| sesion_id | INTEGER FK | |
| tipo | TEXT | residuos / poda / escombros / otro |
| subtipo | TEXT | Depende del tipo |
| detalle_json | TEXT | JSON con foto, comentarios, etc. |
| estado | TEXT | pendiente / en_proceso / requiere_info / resuelto / cancelado |
| creado_en | DATETIME | |
| actualizado_en | DATETIME | |

### `mensajes`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | |
| reclamo_id | INTEGER FK | |
| sesion_id | INTEGER FK | |
| remitente | TEXT | usuario / agente / bot |
| contenido | TEXT | |
| tipo | TEXT | texto / opcion / archivo |
| creado_en | DATETIME | |

## 🔌 Endpoints de la API

### Sesiones
- `POST /api/sesiones/desde-whatsapp` — Obtiene o crea sesión desde un
  número de WhatsApp. Devuelve token, estado y datos temporales.
- `GET /api/sesiones/validar/:token` — Valida que un token sea válido
  y no haya expirado.
- `POST /api/sesiones/:token/avanzar` — Actualiza estado y datos
  temporales de la sesión.
- `POST /api/sesiones/:token/finalizar` — Crea el reclamo con los datos
  temporales y cierra el flujo.

### Reclamos
- `POST /api/reclamos` — Crea un reclamo (usado por el webchat legacy).
- `GET /api/reclamos/sesion/:token` — Lista los reclamos de una sesión.

### Salud
- `GET /api/health` — Verifica que el backend esté vivo.

## ⚙️ Cómo correr el proyecto

### Requisitos
- Node.js v20 o superior (recomendado v22)
- npm
- Un número de WhatsApp secundario (NO usar el personal)

### Instalación

```bash
npm install

Configuración

Crear un archivo .env en la raíz con:
text

NODE_ENV=development
PORT=3000
DB_PATH=./database/reclamos.sqlite
SESSION_SECRET=cambiame_mas_adelante
WEBCHAT_URL=http://localhost:3000
BACKEND_URL=http://localhost:3000

Ejecución

Importante: siempre correr los comandos desde la raíz del proyecto,
no desde subcarpetas. dotenv busca el .env en el directorio actual.

En dos terminales separadas:
bash

# Terminal 1 — Backend
node backend/index.js

# Terminal 2 — Bot de WhatsApp
node bot/index.js

La primera vez, el bot mostrará un QR. Escanearlo desde WhatsApp →
Dispositivos vinculados. La sesión queda guardada en bot/auth/.
Probar el flujo

    Mandar un mensaje al número del bot desde otro WhatsApp.

    El bot responde con el menú de tipos de reclamo.

    Responder con números (1, 2, 3, 4) para avanzar.

    Al final, el reclamo se guarda en la DB.

⚠️ Advertencias

    Usar un número de WhatsApp secundario. Baileys no es la API oficial
    de WhatsApp. Hay riesgo de bloqueo del número.

    No spamear. Enviar mensajes en ráfagas puede activar mecanismos
    anti-bot de WhatsApp.

    Nunca subir a Git: .env, bot/auth/, node_modules/,
    database/*.sqlite, uploads/.

    Los datos personales (DNI, dirección) requieren cumplir normativa
    de protección de datos si el sistema pasa a producción.

🧭 Decisiones tomadas

    Flujo 100% por WhatsApp, no webchat. El webchat quedó como base
    pero se descartó como experiencia principal.

    Sin IA en v1. El flujo es determinístico y auditable. La IA se
    suma como capa de fallback en el Bloque 7.

    SQLite para práctica. Migrable a PostgreSQL cuando el volumen lo
    requiera.

    Selección por número (1, 2, 3, 4). Rápido de escribir en celular.

    Foto opcional. Nunca traba el flujo.

    Dirección como texto libre. Simple y suficiente.

    Expiración de sesión: 24 hs.

    Despliegue futuro en Oracle Cloud Free Tier.

📚 Glosario

    Bot: programa que se conecta a WhatsApp y responde mensajes.

    Handler: función que decide qué hacer con cada mensaje recibido.

    Backend: servidor con la lógica de negocio y la base de datos.

    Frontend: interfaz visual para el usuario final o el agente.

    Token: identificador único y seguro de una sesión.

    Estado de conversación: en qué paso del flujo está el usuario.

    Máquina de estados: patrón donde el sistema reacciona distinto
    según su estado actual.

📅 Historial de avances

    Bloque 1 — Entorno y estructura del proyecto.

    Bloque 2 — Bot con Baileys conectado y respondiendo.

    Bloque 3 — Backend, DB, tokens, bot conectado al backend.

    Bloque 4 — Webchat con validación de token (descartado).

    Bloque 5 — Flujo conversacional completo por WhatsApp.

    Paso 5.5 — Soporte de fotos (pendiente).

    Bloque 6 — Panel de gestión y reportes (próximo).

    Bloque 7 — Capa de IA (futuro).

    Bloque 8 — Despliegue (futuro).

Proyecto en desarrollo 🚧
