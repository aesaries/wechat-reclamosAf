FLUJO DEL BOT — AGROTÉCNICA FUEGUINA

Versión: 2.0 (validado por CAO)
Fecha: 2026-10-19
Estado: Listo para implementación

OBJETIVO

Reemplazar el flujo actual de "mensaje automático + formulario web + operador" por una conversación única por WhatsApp, guiada por un bot, que registre reclamos, consultas y casos especiales de manera estructurada.

Principios de diseño:

    El bot registra, no rechaza. El CAO decide después.

    Mínima fricción para el usuario.

    24/7, sin depender del horario del CAO.

    No alarmar al usuario con advertencias legales.

    Datos mínimos para que el CAO pueda gestionar.

    Los campos obligatorios tienen escape: si el usuario no puede, se registra igual con una marca.

ITEM 1 — BIENVENIDA

¡Hola! ?? Soy el asistente virtual de Agrotécnica Fueguina.

¿En qué puedo ayudarte?

    Hacer un reclamo

    Consultar horarios o frecuencias

    Otros casos

OPCIÓN 1 — HACER UN RECLAMO

Paso 1 — Servicio:

¿Sobre qué servicio?

    Recolección de residuos

    Barrido

    Poda acondicionada

    Escombros acondicionados

    Microbasurales

    Situación particular

Paso 2 — Preguntas específicas según servicio:

Si es Poda (3) o Escombros (4):

¿Está acondicionado según las reglas?
(máximo 1 m³, atado o embolsado)

    Sí, está acondicionado

    No está acondicionado

Luego:

¿Cuánto volumen estimás?

    Menos de 1 m³ (menos de 4 bolsas)

    Aproximadamente 1 m³ (4 bolsas)

    Más de 1 m³

Si es Situación particular (6):

Entiendo. Contame brevemente qué pasó.

[Texto libre, mínimo 30 caracteres, máximo 1000]

Paso 3 — Cuándo ocurrió:

¿Cuándo ocurrió?

    Hoy

    Ayer

    Hace 2 días

    Hace más de 2 días

Paso 4 — Barrio:

¿Cuál es tu barrio?

Paso 5 — Dirección:

Para reclamos de servicio (1 a 5):

¿Cuál es la dirección? (calle, número)

Si el usuario usó el escape de ubicación, se pide más detalle:

¿Cuál es la dirección? Necesito el mayor detalle posible para que el chofer encuentre el lugar:

• Calle y número
• Entre calles
• Referencia (ej: "frente a la plaza", "al lado del kiosco")

Para Situación particular (6):

¿Cuál es la dirección? (calle, número)

Paso 6 — Ubicación GPS:

Para reclamos de servicio (1 a 5): obligatorio, con escape.

?? Necesito tu ubicación GPS para que el chofer pueda encontrar el lugar.

Tocá clip ?? ? Ubicación ? Enviar mi ubicación actual.
Podés mover el pin en el mapa para marcar el punto exacto.

Si no podés compartirla, escribí "no puedo".

Si el usuario escribe "no puedo" u otra variante:

Entiendo que no podés compartir la ubicación. El reclamo se va a registrar solo con la dirección escrita.

?? Importante: sin la ubicación GPS, el chofer puede tener más dificultades para encontrar el lugar exacto.

¿Querés continuar sin ubicación?

    Sí, continuar

    No, prefiero intentar de nuevo

Si elige 1: avanza al paso de dirección con más detalle.

Para Situación particular (6): opcional.

¿Querés compartir tu ubicación GPS? (opcional)

Tocá clip ?? ? Ubicación ? Enviar mi ubicación actual.

Si no querés compartirla, escribí "saltar".

Paso 7 — Fotos:

Para reclamos de servicio (1 a 5): obligatorio (mínimo 1), con escape.

?? Necesito al menos una foto del problema para poder registrar el reclamo.
Máximo 3 fotos.
Cuando termines, escribí "listo".

Si no podés mandar fotos, escribí "no puedo".

Si el usuario escribe "no puedo" u otra variante:

Entiendo que no podés mandar la foto. El reclamo se va a registrar como "sin foto".

?? Importante: los reclamos sin foto pueden demorar más en procesarse, ya que el equipo tiene que verificar la situación en el lugar.

¿Querés continuar sin foto?

    Sí, continuar

    No, prefiero intentar de nuevo

Si elige 1: avanza con sin_foto: true.

Para Situación particular (6): opcional.

¿Tenés fotos o videos del hecho? (opcional, hasta 3 archivos)

?? Enviá los archivos o escribí "listo" para continuar.
Si no querés agregar ninguno, escribí "saltar".

Nota: los videos son de mucha ayuda como respaldo.

Paso 8 — Nombre:

¿Me confirmás tu nombre y apellido?

Paso 9 — Comentarios extra (opcional):

¿Algún comentario extra? (opcional)

Escribí "saltar" si no querés agregar nada.

Paso 10 — Términos y condiciones:

Si es un reclamo normal (1 a 5):

Antes de enviar, tené en cuenta:

• Plazo: 48 hs desde el hecho.
• Respuesta: hasta 15 días hábiles.
• Datos confidenciales.

Aceptás los términos completos:
https://af-salta.com.ar/terminos

¿Confirmás el envío?

    Sí, enviar

    No, cancelar

Si es Situación particular (6):

Al enviar esta solicitud, aceptás los siguientes términos:

• La empresa evaluará el caso con prioridad y se comunicará a la brevedad.
• La información será tratada de manera confidencial.
• La empresa se reserva el derecho de aceptar o rechazar la solicitud.
• Plazo de respuesta: hasta 15 días hábiles.
• Jurisdicción: tribunales de la ciudad de Salta, Argentina.

¿Aceptás estos términos y querés enviar el reclamo?

    Sí, enviar

    No, cancelar

Paso 11 — Confirmación:

Si es un reclamo normal:

? Reclamo #2026-0042 registrado.

Servicio: [servicio]
Barrio: [barrio]
Dirección: [dirección]

Te vamos a contactar a la brevedad.

Guardá tu número de reclamo para futuras consultas.

Si es Situación particular:

? Reclamo #2026-0043 registrado.

Tipo: Situación particular
Barrio: [barrio]

Por la naturaleza de tu caso, un responsable va a revisarlo con prioridad.
Te van a contactar a la brevedad.

Guardá tu número de reclamo.

OPCIÓN 2 — CONSULTAR HORARIOS O FRECUENCIAS

Paso 1 — Servicio:

¿Sobre qué servicio querés consultar?

    Recolección

    Barrido

    Poda

    Escombros

Paso 2 — Respuesta según servicio:

Recolección:

??? Horarios de recolección:

Turno matutino: a partir de las 6 AM, de lunes a sábado.
Turno nocturno: a partir de las 21 hs, de domingo a viernes.

Recordá dejar los residuos correctamente acondicionados.

Barrido:

?? Frecuencia de barrido:

El servicio se realiza 2 veces por semana en tu zona.

Si notás que no se está cumpliendo, podés hacer un reclamo desde el menú principal.

Poda:

?? Poda acondicionada:

• Máximo 1 m³ (equivalente a 4 bolsas medianas de consorcio).
• Debe estar atada o embolsada.
• Se retira en el mismo horario que la recolección normal de tu barrio.

Si está acondicionada y no la retiran, podés hacer un reclamo.

Escombros:

?? Escombros acondicionados:

• Máximo 1 m³ (equivalente a 4 bolsas medianas de consorcio).
• En bolsas livianas (no muy pesadas).
• Se retiran en el mismo horario que la recolección normal de tu barrio.

Si están acondicionados y no los retiran, podés hacer un reclamo.

Paso 3 — Cierre:

¿Necesitás algo más?

    Sí, volver al menú

    No, gracias

OPCIÓN 3 — OTROS CASOS

Paso 1 — Caso:

¿Cuál de estos casos es?

    Animales muertos

    Poda de árboles (no de residuos)

    Residuos peligrosos o patológicos

    Limpieza de terrenos / vías / canales

    Caso fuera de nuestra área

    Otro caso especial

Paso 2 — Respuesta según caso:

Animales muertos:

?? Para animales muertos, comunicate con el 147 de la Municipalidad de Salta.

Poda de árboles:

?? Para poda de árboles (no residuos de poda), comunicate con el 105 de la Municipalidad de Salta.

Residuos peligrosos o patológicos:

?? Para residuos peligrosos (pilas, tóners, aceites) o patológicos, comunicate con Hábitat Ecológico: 4283490.

Limpieza de terrenos / vías / canales:

Para limpieza de terrenos baldíos, vías del ferrocarril o canales que no nos corresponden, comunicate con el 147 de la Municipalidad de Salta.

Caso fuera de nuestra área:

Ese caso corresponde a otra jurisdicción. Por favor, comunicate con la Municipalidad de tu localidad.

Otro caso especial:

Para casos especiales no contemplados, comunicate con el 147 de la Municipalidad de Salta, o llamanos al [teléfono del CAO] en horario de 8 a 16 hs.

Paso 3 — Cierre:

¿Necesitás algo más?

    Sí, volver al menú

    No, gracias

COMANDOS GLOBALES

Disponibles en cualquier momento del flujo:

    "hola" o cualquier saludo ? volver al menú principal.

    "cancelar" ? cancelar la operación actual.

    "ayuda" ? mostrar el menú principal.

MANEJO DE CASOS ESPECIALES

Mensajes no soportados:

    Audio: "Por ahora no puedo escuchar audios. ¿Me lo escribís por texto? Gracias."

    Video: "Por ahora no puedo ver videos. ¿Me lo contás por texto? Gracias."

    Documento: "Por ahora no puedo abrir documentos. ¿Me lo escribís por texto? Gracias."

    Sticker: "No puedo procesar stickers. ¿Me lo escribís por texto? Gracias."

    Contacto: "Por ahora no puedo procesar contactos. ¿Me lo escribís por texto? Gracias."

    Encuesta: "No puedo procesar encuestas. ¿Me lo escribís por texto? Gracias."

Timeout de inactividad:

Si pasan 15 minutos sin actividad del usuario, el flujo se resetea al menú principal (silencioso, sin aviso).

Recordatorio de fotos:

Si el usuario mandó al menos una foto y pasan 30 segundos sin actividad, el bot envía:

¿Terminaste? Escribí "listo" para continuar o "saltar" para finalizar sin más fotos.

Recordatorio de campos obligatorios (foto o ubicación):

Si pasan 60 segundos sin actividad en los pasos de foto o ubicación (reclamos de servicio), el bot envía:

¿Necesitás ayuda? Si no podés mandar [foto/ubicación], escribí "no puedo" y seguimos.

Escapes de campos obligatorios:

Palabras clave que activan el escape:

    "no puedo"

    "no me deja"

    "no sé cómo"

    "no tengo"

    "no se puede"

    "no funciona"

    "sin foto" (para fotos)

    "sin ubicación" (para ubicación)

Confirmación del escape:

    Acepta: "sí", "dale", "ok", "1".

DATOS QUE SE GUARDAN POR RECLAMO

numero_reclamo: Formato 2026-0001
tipo: recoleccion / barrido / poda / escombros / microbasural / situacion_particular
subtipo: acondicionado_si / acondicionado_no (solo poda/escombros)
volumen: menos_1m3 / aprox_1m3 / mas_1m3 (solo poda/escombros)
cuando: hoy / ayer / hace_2_dias / mas_2_dias
barrio: Texto libre
direccion: Texto libre
ubicacion: {lat, lng, nombre, direccion_mapa} o null
fotos: Array de rutas o []
nombre: Texto libre
comentarios: Texto libre o null
descripcion_libre: Solo para Situación particular
acepto_terminos: true
fecha_aceptacion: Fecha y hora
prioridad: normal / alta (alta solo para Situación particular)
estado: pendiente / en_proceso / resuelto / cancelado
tiene_foto: true / false (solo reclamos de servicio)
motivo_sin_foto: Texto libre o null
tiene_ubicacion: true / false (solo reclamos de servicio)
motivo_sin_ubicacion: Texto libre o null

Nota: para Situación particular, tiene_foto y tiene_ubicacion son siempre false (no aplica obligatoriedad).

NOTAS PARA VALIDACIÓN CON EL CAO

Cuando se valide este flujo con atención al público, prestar atención a:

    Textos de las respuestas. ¿El tono es correcto? ¿Falta algún dato?

    Orden de las preguntas. ¿Es lógico para el usuario?

    Números de teléfono. Verificar que estén actualizados.

    Nombre "Situación particular". ¿Les sirve? ¿Prefieren otro?

    Resumen final. ¿Les alcanza con servicio/barrio/dirección?

    Términos de Situación particular. Deben pasar por el abogado.

    Frecuencia de barrido (2 veces por semana). ¿Es siempre así o varía por zona?

HISTORIAL DE CAMBIOS

v2.0 (2026-10-19): Validado por CAO. Foto y ubicación GPS obligatorias para reclamos de servicio (con escape). Situación particular: ambos opcionales. Agregados campos tiene_foto, motivo_sin_foto, tiene_ubicacion, motivo_sin_ubicacion. Recordatorio de campos obligatorios a los 60 segundos.

v1.0 (2026-10-07): Borrador inicial para validación.

FIN DEL FLUJO