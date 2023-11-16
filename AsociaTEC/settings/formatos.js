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
const formatearHoraRelativa = (minutos) => {
    const formateador = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

    let unidad = "minute";
    let diferencia = minutos;

    if (minutos >= 60 * 24) {
        diferencia = Math.floor(diferencia / (minutos * 60 * 24));
        unidad = "day";
    } else if (minutos >= 60) {
        diferencia = Math.floor(diferencia / (minutos * 60));
        unidad = "hour";
    }

    return formateador.format(diferencia, unidad);
};
module.exports = { idiomaLocal, formatoFecha, formatoHora, formatearHoraRelativa };
