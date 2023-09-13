const express = require("express");
const router = express.Router();
const { pool, sqlcon } = require("../settings/database.js");
const manejarError = require("../settings/errores.js");
const estaAutenticado = require("../settings/autenticado.js");

/**
 * Método GET
 * Retorna la lista de encuestas
 */
router.get("/", (req, res) => {
    if (!estaAutenticado(req, true, true)) {
        return res.status(403).send({ mensaje: "Acceso denegado" });
    }

    const { evento, carnet } = req.query;

    const request = pool.request();

    try {
        if (evento) {
            request.input("IN_evento", sqlcon.UniqueIdentifier, evento);
        }

        if (carnet) {
            request.input("IN_carnet", sqlcon.Int, carnet);
        }
    } catch (error) {
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Retroalimentacion_Lista", (error, result) => {
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
 * Retorna los detalles de una encuesta en particular
 */
router.get("/detalles", (req, res) => {
    const { evento, carnet } = req.query;

    if (!estaAutenticado(req, true, true, carnet)) {
        return res.status(403).send({ mensaje: "Acceso denegado" });
    }

    const request = pool.request();

    try {
        request.input("IN_evento", sqlcon.UniqueIdentifier, evento);
        request.input("IN_carnet", sqlcon.Int, carnet);
    } catch (error) {
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute(
        "AsociaTEC_SP_Retroalimentacion_Detalles",
        (error, result) => {
            if (error) {
                manejarError(res, error);
            } else {
                res.setHeader("Content-Type", "application/json").send(
                    result.recordset[0]["results"]
                );
            }
        }
    );
});

/**
 * Metodo POST
 * Agrega una encuesta en particular
 */
router.post("/agregar", (req, res) => {
    const { evento, carnet, calificacion, comentario } = req.body;

    if (!estaAutenticado(req, true, true, carnet)) {
        return res.status(403).send({ mensaje: "Acceso denegado" });
    }

    const request = pool.request();

    try {
        request.input("IN_evento", sqlcon.UniqueIdentifier, evento);
        request.input("IN_carnet", sqlcon.Int, carnet);
        request.input("IN_calificacion", sqlcon.TinyInt, calificacion);
        request.input("IN_comentario", sqlcon.VarChar(256), comentario);
    } catch (error) {
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute(
        "AsociaTEC_SP_Retroalimentacion_Agregar",
        (error, result) => {
            if (error) {
                manejarError(res, error);
            } else {
                return res
                    .status(200)
                    .send({ mensaje: "Registrado con éxito" });
            }
        }
    );
});

module.exports = router;
