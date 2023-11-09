const express = require("express");
const router = express.Router();
const { pool, sqlcon } = require("../settings/database.js");
const manejarError = require("../settings/errores.js");
const estaAutenticado = require("../settings/autenticado.js");

//descripcion: retorna la lista de los estudiantes con solicitudes para ser colaboradores
//parametros: correo, uuidEvento, acceptado
//Retorna: {carnet, apellido1, apellido2, nombre, aceptado}
//SP : AsociaTEC_SP_Solicitudes_Lista
router.get("/", (req, res) => {
    
    if (!estaAutenticado(req, true, true)) {
        return res.status(403).send({ mensaje: "Acceso denegado" });
    }
    
    const request = pool.request();
    const correo = req.query.correo;
    const uuid = req.query.uuid;
    const filtro = req.query.filtro;

    try {
        request.input("IN_Correo", sqlcon.VarChar(128), correo);
        request.input("IN_identificadorEvento", sqlcon.UniqueIdentifier, uuid);
        request.input("IN_filtro", sqlcon.VarChar(16), filtro);
    } catch (error) {
        console.log(error);
        return res.status(400).send({ mensaje: "Datos invalidos" });
    }
    request.execute("AsociaTEC_SP_Solicitudes_Lista", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.setHeader("Content-Type", "application/json").send(
                result.recordset[0]["results"]
            );
        }
    });
});

//descripcion: Accepta o rechaza una solicitud
//parametros: bool, carnet, uuidEvento, descripcion(opcional) [importan cuando es acceptada]
//Retorna: null
//SP : AsociaTEC_SP_Solicitudes_Decidir
router.post("/decidir", (req, res) => {
    
    if (!estaAutenticado(req, true, true)) {
        return res.status(403).send({ mensaje: "Acceso denegado" });
    }
    
    const request = pool.request();
    const carnet = req.body.carnet;
    const descripcion = req.body.descripcion;
    const uuid = req.body.uuid;
    const aceptar = parseInt(req.body.aceptar, 10);

    try {
        request.input("IN_acceptado", sqlcon.Bit, aceptar);
        request.input("IN_carnet", sqlcon.Int, carnet);
        request.input("IN_identificadorEvento", sqlcon.UniqueIdentifier, uuid);
        request.input("IN_descripcion", sqlcon.VarChar(64), descripcion);
    } catch (error) {
        console.log(error);
        return res.status(400).send({ mensaje: "Datos invalidos" });
    }
    request.execute("AsociaTEC_SP_Solicitudes_Decidir", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.status(200).send({
                mensaje: (aceptar == 0)?"Solicitud rechazada exitosamente":"Solicitud aceptada correctamente",
            });
        }
    });
});

//descripcion: Agrega una solicitud de un estudiante para ser colaborador
//parametros: carnet, uuidEvento
//Retorna: null
//SP : AsociaTEC_SP_Solicitudes_Agregar
router.post("/agregar", (req, res) => {
    
    const carnet = req.body.carnet;

    if (!estaAutenticado(req, true, true,carnet)) {
        return res.status(403).send({ mensaje: "Acceso denegado" });
    }
    
    const request = pool.request();
    
    const uuid = req.body.uuid;

    try {
        request.input("IN_carnet", sqlcon.Int, carnet);
        request.input("IN_identificadorEvento", sqlcon.UniqueIdentifier, uuid);
    } catch (error) {
        console.log(error);
        return res.status(400).send({ mensaje: "Datos invalidos" });
    }
    request.execute("AsociaTEC_SP_Solicitudes_Agregar", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.status(200).send({
                mensaje: "Solicitud agregada exitosamente",
            });
        }
    });
});

//descripcion: elimina la solicitud pendiente del estudiante
//parametros: carnet, uuidEvento
//Retorna: null
//SP : AsociaTEC_SP_Colaboradores_Eliminar
router.delete("/eliminar", (req, res) => {
    
    const carnet = req.query.carnet;

    if (!estaAutenticado(req, true, false, carnet)) {
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
    request.execute("AsociaTEC_SP_Solicitudes_Eliminar", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.status(200).send({
                mensaje: "Solicitud eliminada correctamente",
            });
        }
    });
});

module.exports = router;