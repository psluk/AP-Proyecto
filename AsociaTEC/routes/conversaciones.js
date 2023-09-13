const express = require("express");
const router = express.Router();
const { pool, sqlcon } = require("../settings/database.js");
const manejarError = require("../settings/errores.js");
const estaAutenticado = require("../settings/autenticado.js");

//descripcion: retorna la lista de las conversaciones
//parametros: titulo?, tags?
//Retorna: titulo, uuidConversacion, timestamp, [tags]
//SP : AsociaTEC_SP_Conversaciones_Lista
router.get("/", (req, res) => {
    const titulo = req.query.titulo;
    const tags = req.query.tags;
    const tvp = new sqlcon.Table();
    tvp.columns.add("IN_tags", sqlcon.VarChar(32));
    const request = pool.request();

    try {
        if (tags == null || tags == "") {
        } else {
            tags.forEach((element) => {
                tvp.rows.add(element);
            });
        }
    } catch {
        tvp.rows.add(tags);
    }

    try {
        request.input("IN_titulo", sqlcon.VarChar, titulo);
        request.input("IN_tags", tvp);
    } catch (error) {
        console.log(error);
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Conversaciones_Lista", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.setHeader("Content-Type", "application/json").send(
                result.recordset[0]["results"]
            );
        }
    });
});

//descripcion: agrega una nueva conversacion
//parametros: correo, titulo, [tags]
//Retorna: NULL
//SP : AsociaTEC_SP_Conversaciones_Agregar
router.post("/agregar", (req, res) => {
        
    const correo = req.body.correo;
    const titulo = req.body.titulo;
    const tags = req.body.tags;
    const tvp = new sqlcon.Table();
    tvp.columns.add("IN_tags", sqlcon.VarChar(32));
    const request = pool.request();

    try {
        tags.forEach((element) => {
            tvp.rows.add(element);
        });
    } catch {
        tvp.rows.add(tags);
    }

    try {
        request.input("IN_correo", sqlcon.VarChar, correo);
        request.input("IN_titulo", sqlcon.VarChar, titulo);
        request.input("IN_tags", tvp);
    } catch (error) {
        console.log(error);
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Conversaciones_Agregar", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.status(200).send("Agregado con éxito");
        }
    });
});

//descripcion: elimina una conversacion
//parametros: uuidConversacion, carnet, (correo>> falta)
//Retorna: NULL
//SP : AsociaTEC_SP_Conversaciones_Eliminar
router.delete("/eliminar", (req, res) => {
    
    const carnet = req.body.carnet;
    if (!estaAutenticado(req, true, true, carnet)) {
        return res.status(403).send({ mensaje: "Acceso denegado" });
    }

    const uuid = req.query.uuid;
    const correo = req.query.correo;
    const request = pool.request();

    try {
        request.input("IN_identificadorConversacion",sqlcon.UniqueIdentifier,uuid);
        //request.input("IN_correo",sqlcon.UniqueIdentifier,correo);

    } catch (error) {
        return res.status(400).send("Identificador invalido");
    }

    request.execute("AsociaTEC_SP_Conversaciones_Eliminar", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.status(200).send("Eliminado con éxito");
        }
    });
});

module.exports = router;