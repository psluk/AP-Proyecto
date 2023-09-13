const express = require("express");
const router = express.Router();
const { pool, sqlcon } = require("../settings/database.js");
const manejarError = require("../settings/errores.js");
const estaAutenticado = require("../settings/autenticado.js");

/**
 * Metodo GET
 * Retorna la lista de carreras de una sede
 */
router.get("/", (req, res) => {
    if (!estaAutenticado(req, false, false)) {
        return res.status(403).send({ mensaje: "Acceso denegado" });
    }

    const codigoSede = req.query.codigoSede;
    
    const request = pool.request();

    try {
        request.input("IN_sede", sqlcon.VarChar(4), codigoSede);
    } catch (error) {
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Carreras_Lista", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.setHeader("Content-Type", "application/json").send(
                result.recordset[0]["results"]
            );
        }
    });
});

module.exports = router;