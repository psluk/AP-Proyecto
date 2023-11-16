const express = require("express");
const router = express.Router();
const { pool, sqlcon } = require("../settings/database.js");
const manejarError = require("../settings/errores.js");
const estaAutenticado = require("../settings/autenticado.js");
const { enviarCorreo } = require("../settings/correos.js");
const {
    idiomaLocal,
    formatoFecha,
    formatoHora,
} = require("../settings/formatos.js");

/**
 * Metodo GET
 * Retorna la lista de actividades de un evento
 */
router.get("/", (req, res) => {
    const request = pool.request();

    const uuid = req.query.uuid;

    try {
        request.input("IN_uuid", sqlcon.UniqueIdentifier, uuid);
    } catch (error) {
        console.log(error);
        return res.status(400).send({ mensaje: "Datos invalidos" });
    }

    request.execute("AsociaTEC_SP_Actividades_Lista", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.setHeader("Content-Type", "application/json").send(
                result.recordset[0]["results"]
            );
        }
    });
});

/**
 * Metodo GET
 * Retorna los detalles de una actividad
 */
router.get("/detalles", (req, res) => {
    const request = pool.request();

    const uuid = req.query.uuid;

    try {
        request.input("IN_uuid", sqlcon.UniqueIdentifier, uuid);
    } catch (error) {
        console.log(error);
        return res.status(400).send({ mensaje: "Datos invalidos" });
    }

    request.execute("AsociaTEC_SP_Actividades_Detalles", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.setHeader("Content-Type", "application/json").send(
                result.recordset[0]["results"]
            );
        }
    });
});

/**
 * Metodo POST
 * Crea una actividad relacionada a un evento
 */
router.post("/agregar", (req, res) => {
    if (!estaAutenticado(req, true, true)) {
        return res.status(403).send({ mensaje: "Acceso denegado" });
    }

    const request = pool.request();

    const { uuid, nombre, lugar, fechaInicio, fechaFin } = req.body;

    try {
        request.input("IN_uuid", sqlcon.UniqueIdentifier, uuid);
        request.input("IN_nombre", sqlcon.VarChar, nombre);
        request.input("IN_lugar", sqlcon.VarChar, lugar);
        request.input("IN_fechaInicio", sqlcon.DateTime, fechaInicio);
        request.input("IN_fechaFin", sqlcon.DateTime, fechaFin);
    } catch (error) {
        console.log(error);
        return res.status(400).send({ mensaje: "Datos invalidos" });
    }

    request.execute("AsociaTEC_SP_Actividades_Agregar", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.status(200).send({
                mensaje: "Actividad agregada correctamente",
            });

            // Se notifican los cambios
            const resultado = JSON.parse(result.recordset[0]["results"])[0];
            const horaInicio =
                new Intl.DateTimeFormat(idiomaLocal, formatoHora)
                    .format(new Date(resultado.evento.inicio + "Z"))
                    .replace(/(00)(:\d{2})/, "12$2") +
                " (" +
                new Intl.DateTimeFormat(idiomaLocal, formatoFecha).format(
                    new Date(resultado.evento.inicio + "Z")
                ) +
                ")";
            const horaFin =
                new Intl.DateTimeFormat(idiomaLocal, formatoHora)
                    .format(new Date(resultado.evento.fin + "Z"))
                    .replace(/(00)(:\d{2})/, "12$2") +
                " (" +
                new Intl.DateTimeFormat(idiomaLocal, formatoFecha).format(
                    new Date(resultado.evento.fin + "Z")
                ) +
                ")";

            enviarCorreo(
                [],
                "Actualización: " + resultado.evento.titulo,
                `<p>Hola:</p>
                <p>Se agregaron actividades al siguiente evento, al que está inscrito o que ha marcado como evento de interés:</p>
                <ul>
                    <li><b>Nombre:</b> ${resultado.evento.titulo}</li>
                    <li><b>Inicio:</b> ${horaInicio}</li>
                    <li><b>Fin:</b> ${horaFin}</li>
                    <li><b>Asociación:</b> ${resultado.asociacion.nombre}</li>
                </ul>`,
                [],
                // Correos ocultos (CCO/BCC)
                JSON.parse(resultado.evento.correos).map((c) => c.correo)
            );
        }
    });
});

/**
 * Metodo PUT
 * Modifica una actividad
 */
router.put("/modificar", (req, res) => {
    if (!estaAutenticado(req, true, true)) {
        return res.status(403).send({ mensaje: "Acceso denegado" });
    }

    const request = pool.request();

    const { uuid, nombre, lugar, fechaInicio, fechaFin } = req.body;

    try {
        request.input("IN_uuid", sqlcon.UniqueIdentifier, uuid);
        request.input("IN_nombre", sqlcon.VarChar, nombre);
        request.input("IN_lugar", sqlcon.VarChar, lugar);
        request.input("IN_fechaInicio", sqlcon.DateTime, fechaInicio);
        request.input("IN_fechaFin", sqlcon.DateTime, fechaFin);
    } catch (error) {
        console.log(error);
        return res.status(400).send({ mensaje: "Datos invalidos" });
    }

    request.execute("AsociaTEC_SP_Actividades_Modificar", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.status(200).send({
                mensaje: "Actividad modificada correctamente",
            });

            // Se notifican los cambios
            const resultado = JSON.parse(result.recordset[0]["results"])[0];
            const horaInicio =
                new Intl.DateTimeFormat(idiomaLocal, formatoHora)
                    .format(new Date(resultado.evento.inicio + "Z"))
                    .replace(/(00)(:\d{2})/, "12$2") +
                " (" +
                new Intl.DateTimeFormat(idiomaLocal, formatoFecha).format(
                    new Date(resultado.evento.inicio + "Z")
                ) +
                ")";
            const horaFin =
                new Intl.DateTimeFormat(idiomaLocal, formatoHora)
                    .format(new Date(resultado.evento.fin + "Z"))
                    .replace(/(00)(:\d{2})/, "12$2") +
                " (" +
                new Intl.DateTimeFormat(idiomaLocal, formatoFecha).format(
                    new Date(resultado.evento.fin + "Z")
                ) +
                ")";

            enviarCorreo(
                [],
                "Actualización: " + resultado.evento.titulo,
                `<p>Hola:</p>
                <p>Se agregaron modificó una actividad del siguiente evento, al que está inscrito o que ha marcado como evento de interés:</p>
                <ul>
                    <li><b>Nombre:</b> ${resultado.evento.titulo}</li>
                    <li><b>Inicio:</b> ${horaInicio}</li>
                    <li><b>Fin:</b> ${horaFin}</li>
                    <li><b>Asociación:</b> ${resultado.asociacion.nombre}</li>
                </ul>`,
                [],
                // Correos ocultos (CCO/BCC)
                JSON.parse(resultado.evento.correos).map((c) => c.correo)
            );
        }
    });
});

/**
 * Metodo DELETE
 * Modifica una actividad
 */
router.delete("/eliminar", (req, res) => {
    if (!estaAutenticado(req, true, true)) {
        return res.status(403).send({ mensaje: "Acceso denegado" });
    }

    const request = pool.request();

    const uuid = req.query.uuid;

    try {
        request.input("IN_uuid", sqlcon.UniqueIdentifier, uuid);
    } catch (error) {
        console.log(error);
        return res.status(400).send({ mensaje: "Datos invalidos" });
    }

    request.execute("AsociaTEC_SP_Actividades_Eliminar", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.status(200).send({
                mensaje: "Actividad eliminada correctamente",
            });

            // Se notifican los cambios
            const resultado = JSON.parse(result.recordset[0]["results"])[0];
            const horaInicio =
                new Intl.DateTimeFormat(idiomaLocal, formatoHora)
                    .format(new Date(resultado.evento.inicio + "Z"))
                    .replace(/(00)(:\d{2})/, "12$2") +
                " (" +
                new Intl.DateTimeFormat(idiomaLocal, formatoFecha).format(
                    new Date(resultado.evento.inicio + "Z")
                ) +
                ")";
            const horaFin =
                new Intl.DateTimeFormat(idiomaLocal, formatoHora)
                    .format(new Date(resultado.evento.fin + "Z"))
                    .replace(/(00)(:\d{2})/, "12$2") +
                " (" +
                new Intl.DateTimeFormat(idiomaLocal, formatoFecha).format(
                    new Date(resultado.evento.fin + "Z")
                ) +
                ")";

            enviarCorreo(
                [],
                "Actualización: " + resultado.evento.titulo,
                `<p>Hola:</p>
                <p>Se eliminaron actividades del siguiente evento, al que está inscrito o que ha marcado como evento de interés:</p>
                <ul>
                    <li><b>Nombre:</b> ${resultado.evento.titulo}</li>
                    <li><b>Inicio:</b> ${horaInicio}</li>
                    <li><b>Fin:</b> ${horaFin}</li>
                    <li><b>Asociación:</b> ${resultado.asociacion.nombre}</li>
                </ul>`,
                [],
                // Correos ocultos (CCO/BCC)
                JSON.parse(resultado.evento.correos).map((c) => c.correo)
            );
        }
    });
});

module.exports = router;
