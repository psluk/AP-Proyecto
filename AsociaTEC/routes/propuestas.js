const express = require("express");
const router = express.Router();
const { pool, sqlcon } = require("../settings/database.js");
const manejarError = require("../settings/errores.js");
const estaAutenticado = require("../settings/autenticado.js");

/**
 * Método GET
 * Retorna la lista de propuestas
 */
router.get("/", (req, res) => {
    if (!estaAutenticado(req, true, true)) {
        return res.status(403).send({ mensaje: "Acceso denegado" });
    }

    const {
        titulo,
        carnet,
        codigoCarrera,
        codigoSede,
        estado,
        fechaInicio,
        fechaFin,
    } = req.query;

    const request = pool.request();

    try {
        if (titulo) {
            request.input("IN_titulo", sqlcon.VarChar(64), titulo);
        }

        if (carnet) {
            request.input("IN_carnet", sqlcon.Int, carnet);
        }

        if (codigoCarrera) {
            request.input("IN_codigoCarrera", sqlcon.VarChar(4), codigoCarrera);
        }

        if (codigoSede) {
            request.input("IN_codigoSede", sqlcon.VarChar(4), codigoSede);
        }

        if (estado) {
            request.input("IN_estado", sqlcon.VarChar(32), estado);
        }

        if (fechaInicio) {
            request.input("IN_fechaInicio", sqlcon.DateTime, fechaInicio);
        }

        if (fechaFin) {
            request.input("IN_fechaFin", sqlcon.DateTime, fechaFin);
        }
    } catch (error) {
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Propuestas_Lista", (error, result) => {
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
 * Método GET
 * Retorna los detalles de una propuesta
 */
router.get("/detalles", (req, res) => {
    if (!estaAutenticado(req, true, true)) {
        return res.status(403).send({ mensaje: "Acceso denegado" });
    }

    const propuesta = req.query.propuesta;

    const request = pool.request();

    try {
        request.input("IN_propuesta", sqlcon.UniqueIdentifier, propuesta);
    } catch (error) {
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Propuestas_Detalles", (error, result) => {
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
 * Método POST
 * Agrega una propuesta
 */
router.post("/agregar", (req, res) => {
    const {
        carnet,
        codigoCarrera,
        codigoSede,
        titulo,
        tematica,
        objetivos,
        actividades,
        otros,
    } = req.body;

    if (!estaAutenticado(req, true, true, carnet)) {
        return res.status(403).send({ mensaje: "Acceso denegado" });
    }

    const request = pool.request();

    try {
        request.input("IN_carnet", sqlcon.Int, carnet);
        request.input("IN_codigoCarrera", sqlcon.VarChar(4), codigoCarrera);
        request.input("IN_codigoSede", sqlcon.VarChar(4), codigoSede);
        request.input("IN_titulo", sqlcon.VarChar(64), titulo);
        request.input("IN_tematica", sqlcon.VarChar(64), tematica);
        request.input("IN_objetivos", sqlcon.VarChar(256), objetivos);
        request.input("IN_actividades", sqlcon.VarChar(512), actividades);
        request.input("IN_otros", sqlcon.VarChar(512), otros);
    } catch (error) {
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Propuestas_Agregar", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            return res.status(200).send({ mensaje: "Registrado con éxito" });
        }
    });
});

/**
 * Método PUT
 * Modifica el estado de una propuesta una propuesta
 */
router.put("/modificar", (req, res) => {
    if (!estaAutenticado(req, true, true, carnet)) {
        return res.status(403).send({ mensaje: "Acceso denegado" });
    }

    const { propuesta, estado } = req.body;
    const request = pool.request();

    try {
        request.input("IN_propuesto", sqlcon.UniqueIdentifier, propuesta);
        request.input("IN_estado", sqlcon.VarChar(32), estado);
    } catch (error) {
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Propuestas_Modificar", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            return res.status(200).send({ mensaje: "Modificado con éxito" });
        }
    });
});

/**
 * Método DELETE
 * Elimina una propuesta
 */
router.delete("/delete", (req, res) => {
    if (!estaAutenticado(req)) {
        return res.status(403).send({ mensaje: "Acceso denegado" });
    }

    const propuesta = req.query.propuesta;
    const request = pool.request();

    try {
        request.input("IN_propuesta", sqlcon.UniqueIdentifier, propuesta);
    } catch (error) {
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Propuestas_Eliminar", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            return res.status(200).send({ mensaje: "Eliminado con éxito" });
        }
    });
});

module.exports = router;
