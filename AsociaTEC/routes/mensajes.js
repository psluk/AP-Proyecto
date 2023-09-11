const express = require("express");
const router = express.Router();
const { pool, sqlcon } = require("../settings/database.js");
const manejarError = require("../settings/errores.js");
const estaAutenticado = require("../settings/autenticado.js");
const { MAX } = require("mssql");

//descripcion: lista los mensajes de la conversacion
//parametros: uuidConversacion
//Retorna: contenido, timestamp, uuidMensaje, autor:[nombre, carnet]
//SP : AsociaTEC_SP_Mensajes_Lista
router.get("/", (req, res) => {
    const uuid = req.query.uuid;
    const request = pool.request();

    try {
        request.input(
            "IN_identificadorConversacion",
            sqlcon.UniqueIdentifier,
            uuid
        );
    } catch (error) {
        console.log(error);
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Mensajes_Lista", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.setHeader("Content-Type", "application/json").send(
                result.recordset[0]["results"]
            );
        }
    });
});

//descripcion: agrega un mensaje a una conversacion
//parametros: uuidConversacion, contenido, correo
//Retorna: NULL
//SP :AsociaTEC_SP_Mensajes_Agregar
router.post("/agregar", (req, res) => {
    const uuid = req.body.uuid;
    const contenido = req.body.contenido;
    const correo = req.body.correo;
    const request = pool.request();

    try {
        request.input(
            "IN_identificadorConversacion",
            sqlcon.UniqueIdentifier,
            uuid
        );
        request.input("IN_contenido", sqlcon.VarChar(MAX), contenido);
        request.input("IN_correo", sqlcon.VarChar(128), correo);
    } catch (error) {
        console.log(error);
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Mensajes_Agregar", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.status(200).send("Agregado con éxito");
        }
    });
});

//descripcion: elimina el mensaje indicado
//parametros: uuidMensaje
//Retorna: NULL
//SP : AsociaTEC_SP_Mensajes_Eliminar
router.delete("/eliminar", (req, res) => {
    const uuid = req.query.uuid;
    const request = pool.request();

    try {
        request.input("IN_identificadorMensaje", sqlcon.UniqueIdentifier, uuid);
    } catch (error) {
        return res.status(400).send("Identificador invalido");
    }

    request.execute("AsociaTEC_SP_Mensajes_Eliminar", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.status(200).send("Eliminado con éxito.");
        }
    });
});

module.exports = router;