const { pool, sqlcon } = require("./database.js");
const { enviarCorreo } = require("./correos.js");
const { formatearHoraRelativa } = require("./formatos.js");
const activo = process.env.NODE_ENV?.trim() != "development"; // Si está en desarrollo, no se envían correos

const MINUTOS_ANTES = 30; // Minutos antes de la hora del evento para notificar
const INTENTOS_MAXIMOS = 3; // Intentos máximos para notificar un evento

let timeoutEnProceso = null;
let siguienteHora = null;
let siguienteEvento = null;
let intentosRestantes = 3; // Intentos restantes para notificar un evento

function crearTimeout(horaObjetivo = undefined) {
    if (!activo) {
        return;
    }
    if (timeoutEnProceso != null) {
        clearTimeout(timeoutEnProceso);
        timeoutEnProceso = null;
    }

    const horaActual = new Date();
    const siguienteMedianoche = new Date();
    siguienteMedianoche.setUTCHours(24, 0, 0, 0);

    if (!horaObjetivo || (new Date(horaObjetivo)) > siguienteMedianoche) {
        // Si no se da una hora o es mucho tiempo después, se verificará a la siguiente medianoche
        horaObjetivo = siguienteMedianoche;
    } else {
        horaObjetivo = new Date(horaObjetivo);
    }
    siguienteEvento = horaObjetivo.toISOString();
    horaObjetivo.setMinutes(horaObjetivo.getMinutes() - MINUTOS_ANTES);
    siguienteHora = horaObjetivo;

    const diferencia = horaObjetivo - horaActual;
    timeoutEnProceso = setTimeout(notificar, diferencia + 5000); // Unos segundos de margen

    console.log(" Siguiente verificación de eventos a las " + horaObjetivo.toISOString());
}

async function notificar() {
    if (!activo) {
        return;
    }
    const fechaActual = new Date();
    console.log("-----------------------------------------------------------------");
    console.log(" Verificando si hay eventos para notificar...");
    console.log(` - Hora actual: ${fechaActual.toISOString()}`);

    const request = pool.request();

    request.input("IN_minutosAntes", sqlcon.Int, MINUTOS_ANTES);

    // Hora de inicio de los eventos que se van a notificar
    request.input("IN_fechaInicio", sqlcon.DateTime, siguienteEvento);

    request.execute("AsociaTEC_SP_Eventos_Notificar", (error, result) => {
        if (error) {
            console.log("Hubo un error al notificar los eventos: ", error);
            if (intentosRestantes > 0) {
                console.log("Se volverá a intentar notificar en quince segundos");
                console.log(`Intentos restantes: ${intentosRestantes}`);
                intentosRestantes--;
                crearTimeout((new Date).getTime() + 15000);
            } else {
                intentosRestantes = INTENTOS_MAXIMOS;
                crearTimeout();
            }
        } else {
            intentosRestantes = INTENTOS_MAXIMOS;
            const eventosPorNotificar = JSON.parse(result.recordset[0]["eventos"] || '[]');
            if (eventosPorNotificar.length > 0) {
                console.log(`Se notificarán ${eventosPorNotificar.length} eventos`);
                eventosPorNotificar.forEach((evento) => {
                    console.log(` - ${evento["titulo"]}`);
                });

                eventosPorNotificar.forEach((evento) => {
                    // Notificar inscripciones
                    enviarCorreo(
                        [],
                        "Recordatorio: " + evento.titulo,
                        `<p>Hola:</p>
                        <p>Se le recuerda que el evento <b>${evento.titulo}</b> (para el que tiene una inscripción) iniciará <b>${formatearHoraRelativa(MINUTOS_ANTES)}</b>.</p>
                        <p>Puede ver más detalles <a href="https://asociatec.azurewebsites.net/event/${evento.uuid}">aquí</a>.</p>`,
                        [],
                        // Correos ocultos (CCO/BCC)
                        evento.inscripciones.map((inscripcion) => inscripcion.correo)
                    );

                    // Notificar eventos de interés
                    enviarCorreo(
                        [],
                        "Recordatorio: " + evento.titulo,
                        `<p>Hola:</p>
                        <p>Se le recuerda que el evento <b>${evento.titulo}</b> (que marcó como evento de interés) iniciará <b>${formatearHoraRelativa(MINUTOS_ANTES)}</b>.</p>
                        <p>Puede ver más detalles <a href="https://asociatec.azurewebsites.net/event/${evento.uuid}">aquí</a>.</p>`,
                        [],
                        // Correos ocultos (CCO/BCC)
                        evento.interes.map((interes) => interes.correo)
                    );
                });
            } else {
                console.log("No hay eventos para notificar");
            }
            const sigHora = new Date(result.recordset[0]["siguienteHora"]);
            sigHora.setMinutes(sigHora.getMinutes());
            crearTimeout(sigHora);
        }
        console.log("-----------------------------------------------------------------");
    });
}

module.exports = { notificar };