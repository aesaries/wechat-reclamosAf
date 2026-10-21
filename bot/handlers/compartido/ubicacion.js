// bot/handlers/compartido/ubicacion.js

/**
 * Procesa una ubicación fija (pin) entrante y devuelve el objeto listo
 * para guardar en la sesión.
 *
 * @param {object} ubicacion - Objeto extraído con extraerUbicacion()
 * @returns {object|null} Objeto { lat, lng, nombre, direccion_mapa } o null
 */
function procesarUbicacion(ubicacion) {
  if (!ubicacion) return null;

  // Validamos que tenga lat/lng válidos
  if (typeof ubicacion.lat !== "number" || typeof ubicacion.lng !== "number") {
    return null;
  }

  return {
    lat: ubicacion.lat,
    lng: ubicacion.lng,
    nombre: ubicacion.nombre || null,
    direccion_mapa: ubicacion.direccion_mapa || null,
    timestamp: Date.now(),
  };
}

/**
 * Genera el link de Google Maps para una ubicación.
 * Útil para que el CAO pueda abrir el punto directo.
 *
 * @param {object} ubicacion - { lat, lng }
 * @returns {string} URL de Google Maps
 */
function linkGoogleMaps(ubicacion) {
  if (
    !ubicacion ||
    typeof ubicacion.lat !== "number" ||
    typeof ubicacion.lng !== "number"
  ) {
    return null;
  }
  return `https://www.google.com/maps?q=${ubicacion.lat},${ubicacion.lng}`;
}

module.exports = {
  procesarUbicacion,
  linkGoogleMaps,
};
