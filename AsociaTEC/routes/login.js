var express = require("express");
var router = express.Router();
const { pool, sqlcon } = require("../settings/database.js");
const bcrypt = require("bcrypt");
const manejarError = require("../settings/errores.js");

/**
 * Metodo GET
 * Verifica si ya hay un usuario con sesión iniciada
 */
router.get("/login", (req, res) => {
    const saved = req.session.user;

    if (saved) {
        res.send({
            loggedIn: true,
            correo: saved.correo,
            carnet: saved.carnet,
            tipoUsuario: saved.tipoUsuario,
        });
    } else {
        res.send({
            loggedIn: false,
        });
    }
});

/**
 * Metodo GET
 * Cierra la sesión activa
 */

/**
 * Metodo para cerrar la sesión activa
 */
function cerrarSesion(req, res) {
    const saved = req.session.user;

    if (saved) {
        req.session.user = null;
        res.send({
            mensaje: "Ok",
        });
    } else {
        res.status(401).send({
            mensaje: "No hay ninguna sesión activa",
        });
    }
}

router.get("/logout", cerrarSesion);

router.post("/logout", cerrarSesion);


/**
 * Metodo POST
 * Inicia una sesión
 */
router.post("/login", async (req, res) => {
    const request = pool.request();

    // Se lee el cuerpo de la solicitud
    const { correo, clave } = req.body;

    try {
        // Parámetros de entrada del procedimiento almacenado
        request.input("IN_Correo", sqlcon.VarChar, correo);
    } catch (error) {
        console.log(error);
        res.status(401).send({ mensaje: "Datos inválidos" });
        return;
    }

    request.execute("AsociaTEC_SP_IniciarSesion", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            if (result.recordset.length > 0) {
                bcrypt.compare(
                    clave,
                    result.recordset[0].clave,
                    (error, response) => {
                        if (error) {
                            console.log(error);
                            res.status(500).send({
                                mensaje: "Ocurrió un error inesperado ",
                            });
                        } else if (response) {
                            /* Coincide */
                            req.session.user = {
                                correo: result.recordset[0].correo,
                                carnet: result.recordset[0].carnet,
                                tipoUsuario: result.recordset[0].tipoUsuario,
                                codigoCarrera:
                                    result.recordset[0].codigoCarrera,
                                codigoSede: result.recordset[0].codigoSede,
                            };
                            res.send(req.session.user);
                        } else {
                            /* No coincide */
                            res.status(401).send({
                                mensaje: "No coincide el usuario o contraseña",
                            });
                        }
                    }
                );
            } else {
                res.status(401).send({ mensaje: "El usuario no existe" });
            }
        }
    });
});

module.exports = router;
