var express = require("express");
var router = express.Router();
const { sqlcon } = require("../settings/database.js");
const bcrypt = require("bcrypt");
const manejarError = require("../settings/errores.js");

// Verificar si hay una sesión iniciada
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

// Cierre de sesión
router.get("/logout", (req, res) => {
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
});

// Inicio de sesión
router.post("/login", async (req, res) => {
    const request = new sqlcon.Request();

    try {
        // Se lee el cuerpo de la solicitud
        const { correo, clave } = req.body;

        // Parámetros de entrada del procedimiento almacenado
        request.input("IN_Correo", sqlcon.VarChar, email);
    } catch (error) {
        console.log(error);
        res.status(401).send({ mensaje: "Datos inválidos" });
        return;
    }

    request.execute("AsociaTEC_SP_IniciarSesion", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            bcrypt.compare(
                password,
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
                            tipoUsuario: result.recordset[0].TipoUsuario,
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
        }
    });
});

module.exports = router;
