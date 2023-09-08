const express = require("express");
const router = express.Router();
const { pool, sqlcon } = require("../settings/database.js");
const manejarError = require("../settings/errores.js");
const estaAutenticado = require("../settings/autenticado.js")

/**
 * Metodo GET
 * Retorna la lista de recursos
 */
router.get("/", (req, res) => {

    if (!estaAutenticado(req, false, false)) {
        return res.status(403).send('Acceso denegado');
    }

    const request = pool.request();

    request.execute("AsociaTEC_SP_Recursos_Lista", (error, result) => {
        if (error) {
            manejarError(res, error);
        }
        else {

            res.setHeader('Content-Type', 'application/json')
                .send(result.recordset[0]["results"])
        }
    })
});

module.exports = router;