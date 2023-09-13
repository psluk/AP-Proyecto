const express = require("express");
const router = express.Router();
const { pool, sqlcon } = require("../settings/database.js");
const manejarError = require("../settings/errores.js");
const estaAutenticado = require("../settings/autenticado.js");

//descripcion: retorna la lista de los estudiantes que son colaboradores
//parametros: correo, uuidEvento
//Retorna: {carnet, apellido1, apellido2, nombre}
//SP : AsociaTEC_SP_Colaboradores_Lista
router.get("/", (req, res) => {
    if (!estaAutenticado(req, true, true)) {
        return res.status(403).send({ mensaje: "Acceso denegado" });
    }

    const request = pool.request();
    const correo = req.query.correo;
    const uuid = req.query.uuid;

    try {
        request.input("IN_Correo", sqlcon.VarChar(128), correo);
        request.input("IN_identificadorEvento", sqlcon.UniqueIdentifier, uuid);
    } catch (error) {
        console.log(error);
        return res.status(400).send({ mensaje: "Datos invalidos" });
    }
    request.execute("AsociaTEC_SP_Colaboradores_Lista", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.setHeader("Content-Type", "application/json").send(
                result.recordset[0]["results"]
            );
        }
    });
});

//descripcion: elimina al estudiante como colaborador del evento
//parametros: carnet, uuidEvento
//Retorna: null
//SP : AsociaTEC_SP_Colaboradores_Eliminar
router.delete("/eliminar", (req, res) => {
    const carnet = req.query.carnet;

    if (!estaAutenticado(req, true, true, carnet)) {
        return res.status(403).send({ mensaje: "Acceso denegado" });
    }

    const request = pool.request();

    const uuid = req.query.uuid;

    try {
        request.input("IN_carnet", sqlcon.Int, carnet);
        request.input("IN_identificadorEvento", sqlcon.UniqueIdentifier, uuid);
    } catch (error) {
        console.log(error);
        return res.status(400).send({ mensaje: "Datos invalidos" });
    }
    request.execute("AsociaTEC_SP_Colaboradores_Eliminar", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.status(200).send({
                mensaje: "Colaborador eliminado correctamente",
            });
        }
    });
});

//descripcion: agrega al estudiante como colaborador del evento
//parametros: carnet, descripcion, uuidEvento
//Retorna: null
//SP : AsociaTEC_SP_Colaboradores_Agregar
router.post("/agregar", (req, res) => {
    if (!estaAutenticado(req, true, true)) {
        return res.status(403).send({ mensaje: "Acceso denegado" });
    }

    const request = pool.request();
    const carnet = req.body.carnet;
    const descripcion = req.body.descripcion;
    const uuid = req.body.uuid;

    try {
        request.input("IN_carnet", sqlcon.Int, carnet);
        request.input("IN_descripcion", sqlcon.VarChar(64), descripcion);
        request.input("IN_identificadorEvento", sqlcon.UniqueIdentifier, uuid);
    } catch (error) {
        console.log(error);
        return res.status(400).send({ mensaje: "Datos invalidos" });
    }
    request.execute("AsociaTEC_SP_Colaboradores_Agregar", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.status(200).send({
                mensaje: "Colaborador agregado exitosamente",
            });
        }
    });
});

module.exports = router;
