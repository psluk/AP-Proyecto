const express = require("express");
const router = express.Router();
const { pool, sqlcon } = require("../settings/database.js");
const manejarError = require("../settings/errores.js");
const estaAutenticado = require("../settings/autenticado.js")

/**
 * Metodo GET
 * Retorna la lista de eventos
 * Puede ser filtrada por codigo de carrera y/o codigo de sede
 */
router.get("/", (req, res) => {

    if (!estaAutenticado(req, false, false)) {
        return res.status(403).send({ mensaje: "Acceso Denegado" });
    }

    const codigoCarrera = req.query.codigoCarrera;
    const codigoSede = req.query.codigoSede;

    const request = pool.request();

    try {
        if (codigoCarrera) {
            request.input('IN_CodigoCarrera', sqlcon.VarChar, codigoCarrera)
        }

        if (codigoSede) {
            request.input('IN_CodigoSede', sqlcon.VarChar, codigoSede)
        }
    }
    catch (error) {
        console.log(error);
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Eventos_Lista", (error, result) => {
        if (error) {
            manejarError(res, error);
        }
        else {

            res.setHeader('Content-Type', 'application/json')
                .send(result.recordset[0]["results"])
        }
    })
});

/**
 * Metodo GET
 * Retorna los detalles de un evento
 */
router.get("/evento", (req, res) => {
    if (!estaAutenticado(req, false, false)) {
        return res.status(403).send({ mensaje: "Acceso Denegado" });
    }

    const uuid = req.query.uuid

    const request = pool.request();

    try {
        // Parámetros de entrada del procedimiento almacenado
        request.input("IN_uuid", sqlcon.UniqueIdentifier, uuid);
    } catch (error) {
        console.log(error);
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Eventos_Detalles", (error, result) => {
        if (error) {
            manejarError(res, error);
        }
        else {
            res.setHeader('Content-Type', 'application/json')
            res.send(result.recordset[0]['results'])
        }
    });
})

/**
 * Metodo POST
 * Agrega un evento nuevo
 */
router.post("/agregar", (req, res) => {

    if (!estaAutenticado(req, true, true)) {
        return res.status(403).send({ mensaje: "Acceso Denegado" });
    }

    const titulo = req.body.titul;
    const descripcion = req.body.descripcion;
    const fechaInicio = req.body.fechaInicio;
    const fechaFin = req.body.fechaFin;
    const lugar = req.body.lugar;
    const especiales = req.body.especiales;
    const capacidad = req.body.capacidad;
    const categoria = req.body.categoria;
    const sede = req.body.sede;
    const carrera = req.body.carrera;

    const request = pool.request();


    try {
        request.input("IN_Titulo", sqlcon.VarChar, titulo);
        request.input("IN_Descripcion", sqlcon.VarChar, descripcion);
        request.input("IN_FechaInicio", sqlcon.DateTime, fechaInicio);
        request.input("IN_FechaFin", sqlcon.DateTime, fechaFin);
        request.input("IN_Lugar", sqlcon.VarChar, lugar);
        request.input("IN_Especiales", sqlcon.VarChar, especiales);
        request.input("IN_Capacidad", sqlcon.Int, capacidad);
        request.input("IN_Categoria", sqlcon.VarChar, categoria);
        request.input("IN_Sede", sqlcon.VarChar, sede);
        request.input("IN_Carrera", sqlcon.VarChar, carrera);
    }
    catch (error) {
        console.log(error);
        return res.status(400).send({ mensaje: "Datos inválidos" });

    }

    request.execute("AsociaTEC_SP_Eventos_Agregar", (error, result) => {
        if (error) {
            manejarError(res, error);
        }
        else {
            res.send(result.recordset[0]['results']);
        }
    })
})

/**
 * Metodo PUT
 * Modifica un evento
 */
router.put("/modificar", (req, res) => {
    if (!estaAutenticado(req, true, true)) {
        return res.status(403).send({ mensaje: "Acceso Denegado" });
    }
    const titulo = req.body.titulo;
    const descripcion = req.body.descripcion;
    const fechaInicio = req.body.fechaInicio;
    const fechaFin = req.body.fechaFin;
    const lugar = req.body.lugar;
    const especiales = req.body.especiales;
    const capacidad = req.body.capacidad;
    const categoria = req.body.categoria;
    const uuid = req.body.uuid;

    const request = pool.request();
    try {
        request.input("IN_Titulo", sqlcon.VarChar, titulo);
        request.input("IN_Descripcion", sqlcon.VarChar, descripcion);
        request.input("IN_FechaInicio", sqlcon.DateTime, fechaInicio);
        request.input("IN_FechaFin", sqlcon.DateTime, fechaFin);
        request.input("IN_Lugar", sqlcon.VarChar, lugar);
        request.input("IN_Especiales", sqlcon.VarChar, especiales);
        request.input("IN_Capacidad", sqlcon.Int, capacidad);
        request.input("IN_Categoria", sqlcon.VarChar, categoria);
        request.input("IN_uuid", sqlcon.UniqueIdentifier, uuid);
    }
    catch (error) {
        console.log(error);
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Eventos_Modificar", (error, result) => {
        if (error) {
            manejarError(res, error);
        }
        else {
            res.status(200).send("Modificado con éxito");
        }
    })

})

/**
 * Metodo DELETE
 * Elimina un evento
 */
router.delete("/eliminar", (req, res) => {

    if (!estaAutenticado(req, true, true)) {
        return res.status(403).send({ mensaje: "Acceso Denegado" });
    }

    const uuid = req.query.uuid;
    const request = pool.request();

    try {
        request.input("IN_uuid", sqlcon.UniqueIdentifier, uuid);
    }
    catch (error) {
        return res.status(400).send("Identificador invalido")
    }

    request.execute("AsociaTEC_SP_Eventos_Eliminar", (error, result) => {
        if (error) {
            manejarError(res, error);
        }
        else {
            res.status(200).send("Eliminado con éxito.")
        }
    })
})

/**
 * Metodo PUT
 * Incrementa la cantidad de compartidos sobre un evento
 */
router.put("/compartir", (req, res) => {

    if (!estaAutenticado(req, false, false)) {
        return res.status(403).send({ mensaje: "Acceso Denegado" });
    }

    const uuid = req.body.uuid;

    const request = pool.request();

    try {
        request.input("IN_uuid", sqlcon.UniqueIdentifier, uuid)
    }
    catch (error) {
        return res.status(400).send("Identificador invalido.")
    }

    request.execute("AsociaTEC_SP_Eventos_Compartido", (error, result) => {
        if (error) {
            manejarError(res, error);
        }
        else {
            // Falta manejar el envio (Probablemente se hace desde la app)
            res.status(200).send("Compartido con éxito.")
        }
    })
})

/**
 * Metodo GET
 * Retorna los datos para generar el reporte de un evento
 */
router.get("/reporte", (req, res) => {
    if (!estaAutenticado(req, true, true)) {
        return res.status(403).send({ mensaje: "Acceso Denegado" });
    }

    const uuid = req.query.uuid

    const request = pool.request();

    try {
        // Parámetros de entrada del procedimiento almacenado
        request.input("IN_uuid", sqlcon.UniqueIdentifier, uuid);
    } catch (error) {
        console.log(error);
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Eventos_Reporte", (error, result) => {
        if (error) {
            manejarError(res, error);
        }
        else {
            res.setHeader('Content-Type', 'application/json')
            res.send(result.recordset[0]['results'])
        }
    });
})
module.exports = router;