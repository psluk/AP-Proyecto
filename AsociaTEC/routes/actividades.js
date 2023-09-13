const express = require("express");
const router = express.Router();
const { pool, sqlcon } = require("../settings/database.js");
const manejarError = require("../settings/errores.js");
const estaAutenticado = require("../settings/autenticado.js");

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
        }
    });
});

/**
 * Metodo PUT
 * Modifica una actividad
 */
router.put("/modificar", (req, res) => {
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
                mensaje: "Actividad modificada correctamente",
            });
        }
    });
});

/**
 * Metodo DELETE
 * Modifica una actividad
 */
router.delete("/eliminar", (req, res) => {
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
        }
    });
});

module.exports = router;
