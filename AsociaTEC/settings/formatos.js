// Para el formato de las fechas en el envío de correos
const idiomaLocal = ["es-CR", "es"];
const formatoFecha = {
    timeZone: "America/Costa_Rica",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
};
const formatoHora = {
    timeZone: "America/Costa_Rica",
    hour12: true,
    hour: "2-digit",
    minute: "numeric",
};
module.exports = { idiomaLocal, formatoFecha, formatoHora };