// bot/handlers/compartido/comandos.js

// Lista de saludos y comandos de inicio
const SALUDOS = [
  "hola",
  "holaa",
  "holaaa",
  "buenas",
  "buen día",
  "buen dia",
  "buenas tardes",
  "buenas noches",
  "buenos días",
  "buenos dias",
  "hey",
  "hi",
  "hello",
  "qué tal",
  "que tal",
  "qué onda",
  "que onda",
  "empezar",
  "iniciar",
  "comenzar",
  "menu",
  "menú",
];

const CANCELAR = ["cancelar", "cancela", "salir", "abortar"];
const AYUDA = ["ayuda", "help", "opciones", "?", "???", "no entiendo"];

// Textos
const TEXTO_AYUDA = `📖 Ayuda rápida:

• Escribí "hola" para volver al menú principal.
• Escribí "cancelar" para cancelar la operación actual.
• Escribí "ayuda" para ver este mensaje.

Durante el flujo, respondé con el número de la opción.`;

const TEXTO_CANCELADO =
  '❌ Cancelado. Si querés empezar de nuevo, escribí "hola".';

/**
 * Detecta si un texto es un saludo/comando de inicio.
 */
function esSaludo(texto) {
  const t = texto.toLowerCase().trim();
  return SALUDOS.includes(t);
}

/**
 * Detecta si un texto es un comando de cancelación.
 */
function esCancelar(texto) {
  const t = texto.toLowerCase().trim();
  return CANCELAR.includes(t);
}

/**
 * Detecta si un texto es un pedido de ayuda.
 */
function esAyuda(texto) {
  const t = texto.toLowerCase().trim();
  return AYUDA.includes(t);
}

module.exports = {
  SALUDOS,
  CANCELAR,
  AYUDA,
  TEXTO_AYUDA,
  TEXTO_CANCELADO,
  esSaludo,
  esCancelar,
  esAyuda,
};
