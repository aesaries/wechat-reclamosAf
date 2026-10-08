
FLUJO DEL BOT ¡ª AGROT¨¦CNICA FUEGUINA

Versi¨®n: 1.0 (borrador para validaci¨®n con CAO)
Fecha: 2026-10-07
OBJETIVO

Reemplazar el flujo actual de "mensaje autom¨¢tico + formulario web + operador" por una conversaci¨®n ¨²nica por WhatsApp, guiada por un bot, que registre reclamos, consultas y casos especiales de manera estructurada.

Principios de dise?o:

    El bot registra, no rechaza. El CAO decide despu¨¦s.

    M¨ªnima fricci¨®n para el usuario.

    24/7, sin depender del horario del CAO.

    No alarmar al usuario con advertencias legales.

    Datos m¨ªnimos para que el CAO pueda gestionar.

ITEM 1 ¡ª BIENVENIDA

?Hola! ?? Soy el asistente virtual de Agrot¨¦cnica Fueguina.

?En qu¨¦ puedo ayudarte?

    Hacer un reclamo

    Consultar horarios o frecuencias

    Otros casos

OPCI¨®N 1 ¡ª HACER UN RECLAMO

Paso 1 ¡ª Servicio:

?Sobre qu¨¦ servicio?

    Recolecci¨®n de residuos

    Barrido

    Poda acondicionada

    Escombros acondicionados

    Microbasurales

    Situaci¨®n particular

Paso 2 ¡ª Preguntas espec¨ªficas seg¨²n servicio:

Si es Poda (3) o Escombros (4):

?Est¨¢ acondicionado seg¨²n las reglas?
(m¨¢ximo 1 m3, atado o embolsado)

    S¨ª, est¨¢ acondicionado

    No est¨¢ acondicionado

Luego:

?Cu¨¢nto volumen estim¨¢s?

    Menos de 1 m3 (menos de 4 bolsas)

    Aproximadamente 1 m3 (4 bolsas)

    M¨¢s de 1 m3

Si es Situaci¨®n particular (6):

Entiendo. Contame brevemente qu¨¦ pas¨®.

[Texto libre, m¨ªnimo 30 caracteres, m¨¢ximo 1000]

Paso 3 ¡ª Cu¨¢ndo ocurri¨®:

?Cu¨¢ndo ocurri¨®?

    Hoy

    Ayer

    Hace 2 d¨ªas

    Hace m¨¢s de 2 d¨ªas

Paso 4 ¡ª Barrio:

?Cu¨¢l es tu barrio?

Paso 5 ¡ª Direcci¨®n:

?Cu¨¢l es la direcci¨®n? (calle, n¨²mero)

Paso 6 ¡ª Ubicaci¨®n GPS (opcional):

?Quer¨¦s compartir tu ubicaci¨®n GPS? (opcional)

Toc¨¢ clip ?? ¡ú Ubicaci¨®n ¡ú Enviar mi ubicaci¨®n actual.
Pod¨¦s mover el pin en el mapa para marcar el punto exacto.

Si no quer¨¦s compartirla, escrib¨ª "saltar".

Paso 7 ¡ª Fotos (opcional):

Si es un reclamo normal (1 a 5):

?Quer¨¦s agregar fotos? (opcional, hasta 3)

?? Envi¨¢ las fotos o escrib¨ª "listo" para continuar.
Si no quer¨¦s agregar ninguna, escrib¨ª "saltar".

Si es Situaci¨®n particular (6):

?Ten¨¦s fotos o videos del hecho? (opcional, hasta 3 archivos)

?? Envi¨¢ los archivos o escrib¨ª "listo" para continuar.
Si no quer¨¦s agregar ninguno, escrib¨ª "saltar".

Nota: los videos son de mucha ayuda como respaldo.

Paso 8 ¡ª Nombre:

?Me confirm¨¢s tu nombre y apellido?

Paso 9 ¡ª Comentarios extra (opcional):

?Alg¨²n comentario extra? (opcional)

Escrib¨ª "saltar" si no quer¨¦s agregar nada.

Paso 10 ¡ª T¨¦rminos y condiciones:

Si es un reclamo normal (1 a 5):

Antes de enviar, ten¨¦ en cuenta:

? Plazo: 48 hs desde el hecho.
? Respuesta: hasta 15 d¨ªas h¨¢biles.
? Datos confidenciales.

Acept¨¢s los t¨¦rminos completos:
https://af-salta.com.ar/terminos

?Confirm¨¢s el env¨ªo?

    S¨ª, enviar

    No, cancelar

Si es Situaci¨®n particular (6):

Al enviar esta solicitud, acept¨¢s los siguientes t¨¦rminos:

? La empresa evaluar¨¢ el caso con prioridad y se comunicar¨¢ a la brevedad.
? La informaci¨®n ser¨¢ tratada de manera confidencial.
? La empresa se reserva el derecho de aceptar o rechazar la solicitud.
? Plazo de respuesta: hasta 15 d¨ªas h¨¢biles.
? Jurisdicci¨®n: tribunales de la ciudad de Salta, Argentina.

?Acept¨¢s estos t¨¦rminos y quer¨¦s enviar el reclamo?

    S¨ª, enviar

    No, cancelar

Paso 11 ¡ª Confirmaci¨®n:

Si es un reclamo normal:

? Reclamo #2026-0042 registrado.

Servicio: [servicio]
Barrio: [barrio]
Direcci¨®n: [direcci¨®n]

Te vamos a contactar a la brevedad.

Guard¨¢ tu n¨²mero de reclamo para futuras consultas.

Si es Situaci¨®n particular:

? Reclamo #2026-0043 registrado.

Tipo: Situaci¨®n particular
Barrio: [barrio]

Por la naturaleza de tu caso, un responsable va a revisarlo con prioridad.
Te van a contactar a la brevedad.

Guard¨¢ tu n¨²mero de reclamo.

OPCI¨®N 2 ¡ª CONSULTAR HORARIOS O FRECUENCIAS

Paso 1 ¡ª Servicio:

?Sobre qu¨¦ servicio quer¨¦s consultar?

    Recolecci¨®n

    Barrido

    Poda

    Escombros

Paso 2 ¡ª Respuesta seg¨²n servicio:

Recolecci¨®n:

??? Horarios de recolecci¨®n:

Turno matutino: a partir de las 6 AM, de lunes a s¨¢bado.
Turno nocturno: a partir de las 21 hs, de domingo a viernes.

Record¨¢ dejar los residuos correctamente acondicionados.

Barrido:

?? Frecuencia de barrido:

El servicio se realiza 2 veces por semana en tu zona.

Si not¨¢s que no se est¨¢ cumpliendo, pod¨¦s hacer un reclamo desde el men¨² principal.

Poda:

?? Poda acondicionada:

? M¨¢ximo 1 m3 (equivalente a 4 bolsas medianas de consorcio).
? Debe estar atada o embolsada.
? Se retira en el mismo horario que la recolecci¨®n normal de tu barrio.

Si est¨¢ acondicionada y no la retiran, pod¨¦s hacer un reclamo.

Escombros:

?? Escombros acondicionados:

? M¨¢ximo 1 m3 (equivalente a 4 bolsas medianas de consorcio).
? En bolsas livianas (no muy pesadas).
? Se retiran en el mismo horario que la recolecci¨®n normal de tu barrio.

Si est¨¢n acondicionados y no los retiran, pod¨¦s hacer un reclamo.

Paso 3 ¡ª Cierre:

?Necesit¨¢s algo m¨¢s?

    S¨ª, volver al men¨²

    No, gracias

OPCI¨®N 3 ¡ª OTROS CASOS

Paso 1 ¡ª Caso:

?Cu¨¢l de estos casos es?

    Animales muertos

    Poda de ¨¢rboles (no de residuos)

    Residuos peligrosos o patol¨®gicos

    Limpieza de terrenos / v¨ªas / canales

    Caso fuera de nuestra ¨¢rea

    Otro caso especial

Paso 2 ¡ª Respuesta seg¨²n caso:

Animales muertos:

?? Para animales muertos, comunicate con el 147 de la Municipalidad de Salta.

Poda de ¨¢rboles:

?? Para poda de ¨¢rboles (no residuos de poda), comunicate con el 105 de la Municipalidad de Salta.

Residuos peligrosos o patol¨®gicos:

?? Para residuos peligrosos (pilas, t¨®ners, aceites) o patol¨®gicos, comunicate con H¨¢bitat Ecol¨®gico: 4283490.

Limpieza de terrenos / v¨ªas / canales:

Para limpieza de terrenos bald¨ªos, v¨ªas del ferrocarril o canales que no nos corresponden, comunicate con el 147 de la Municipalidad de Salta.

Caso fuera de nuestra ¨¢rea:

Ese caso corresponde a otra jurisdicci¨®n. Por favor, comunicate con la Municipalidad de tu localidad.

Otro caso especial:

Para casos especiales no contemplados, comunicate con el 147 de la Municipalidad de Salta, o llamanos al [tel¨¦fono del CAO] en horario de 8 a 16 hs.

Paso 3 ¡ª Cierre:

?Necesit¨¢s algo m¨¢s?

    S¨ª, volver al men¨²

    No, gracias

COMANDOS GLOBALES

Disponibles en cualquier momento del flujo:

    "hola" o cualquier saludo ¡ú volver al men¨² principal.

    "cancelar" ¡ú cancelar la operaci¨®n actual.

    "ayuda" ¡ú mostrar el men¨² principal.

MANEJO DE CASOS ESPECIALES

Mensajes no soportados:

    Audio: "Por ahora no puedo escuchar audios. ?Me lo escrib¨ªs por texto? Gracias."

    Video: "Por ahora no puedo ver videos. ?Me lo cont¨¢s por texto? Gracias."

    Documento: "Por ahora no puedo abrir documentos. ?Me lo escrib¨ªs por texto? Gracias."

    Sticker: "No puedo procesar stickers. ?Me lo escrib¨ªs por texto? Gracias."

    Contacto: "Por ahora no puedo procesar contactos. ?Me lo escrib¨ªs por texto? Gracias."

    Encuesta: "No puedo procesar encuestas. ?Me lo escrib¨ªs por texto? Gracias."

Timeout de inactividad:

Si pasan 15 minutos sin actividad del usuario, el flujo se resetea al men¨² principal (silencioso, sin aviso).

Recordatorio de fotos:

Si el usuario mand¨® al menos una foto y pasan 30 segundos sin actividad, el bot env¨ªa:

?Terminaste? Escrib¨ª "listo" para continuar o "saltar" para finalizar sin m¨¢s fotos.

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
descripcion_libre: Solo para Situaci¨®n particular
acepto_terminos: true
fecha_aceptacion: Fecha y hora
prioridad: normal / alta (alta solo para Situaci¨®n particular)
estado: pendiente / en_proceso / resuelto / cancelado



v1.0 (2026-10-07): Borrador inicial para validaci¨®n.

FIN DEL FLUJO