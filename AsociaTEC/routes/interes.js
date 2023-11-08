const express = require("express");
const router = express.Router();
const { pool, sqlcon } = require("../settings/database.js");
const manejarError = require("../settings/errores.js");
const estaAutenticado = require("../settings/autenticado.js");

/**
 * Método POST
 * Agrega un evento de interés
 */
router.post("/agregar", (req, res) => {
    const { evento, carnet } = req.body;

    if (carnet) {
        if (!estaAutenticado(req, true, true, carnet)) {
            return res.status(403).send({ mensaje: "Acceso denegado" });
        }
    } else {
        if (!estaAutenticado(req, true, true)) {
            return res.status(403).send({ mensaje: "Acceso denegado" });
        }
    }

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

    request.execute("AsociaTEC_SP_Interes_Agregar", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            return res.status(200).send({ mensaje: "Ejecutado con éxito" });
        }
    });
});

/**
 * Método DELETE
 * Elimina un evento de interés
 */
router.delete("/eliminar", (req, res) => {
    const { evento, carnet } = req.query;

    if (carnet) {
        if (!estaAutenticado(req, true, true, carnet)) {
            return res.status(403).send({ mensaje: "Acceso denegado" });
        }
    } else {
        if (!estaAutenticado(req, true, true)) {
            return res.status(403).send({ mensaje: "Acceso denegado" });
        }
    }

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

    request.execute("AsociaTEC_SP_Interes_Eliminar", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            return res.status(200).send({ mensaje: "Ejecutado con éxito" });
        }
    });
});

module.exports = router;
