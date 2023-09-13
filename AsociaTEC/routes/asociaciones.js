const express = require("express");
const router = express.Router();
const { pool, sqlcon } = require("../settings/database.js");
const manejarError = require("../settings/errores.js");
const estaAutenticado = require("../settings/autenticado.js");

//descripcion: devuelve una lista de las asociaciones
//parametros: codigoSede?, codigoCarrera?
//Retorna: nombreAsocia, correo, nombreSede, codigoSede, nombreCarrera, codigoCarrera
//SP : AsociaTEC_SP_Asociaciones_Lista
router.get("/", (req, res) => {
    const codigoCarrera = req.query.codigoCarrera;
    const codigoSede = req.query.codigoSede;
    const request = pool.request();

    try {
        if (codigoCarrera) {
            request.input("IN_CodigoCarrera", sqlcon.VarChar(4), codigoCarrera);
        }

        if (codigoSede) {
            request.input("IN_CodigoSede", sqlcon.VarChar(4), codigoSede);
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Asociaciones_Lista", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.setHeader("Content-Type", "application/json").send(
                result.recordset[0]["results"]
            );
        }
    });
});

//descripcion: devuelve todos los detalles de las asociaciones
//parametros: correo
//Retorna: asociacion: [nombre, correo, telefono, descripcion], carrera: [nombre, codigo], sede:[nombre, codigo]
//SP : AsociaTEC_SP_Asociaciones_Detalles
router.get("/detalles", (req, res) => {
    const correo = req.query.correo;
    const request = pool.request();

    try {
        // Parámetros de entrada del procedimiento almacenado
        request.input("IN_correo", sqlcon.VarChar(128), correo);
    } catch (error) {
        console.log(error);
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Asociaciones_Detalles", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.setHeader("Content-Type", "application/json");
            res.send(result.recordset[0]["results"]);
        }
    });
});

//descripcion: agrega una asociacion (validacion de correo es unicamente para "@estudiantec.cr")
//parametros: nombre, descripcion, telefono, codigoCarreda, codigoSede,  correo, clave
//Retorna: NULL
//SP : AsociaTEC_SP_Asociaciones_Agregar
router.post("/agregar", (req, res) => {
    const nombre = req.body.nombre;
    const descripcion = req.body.descripcion;
    const telefono = req.body.telefono;
    const codigoSede = req.body.codigoSede;
    const codigoCarrera = req.body.codigoCarrera;
    const correo = req.body.correo;
    const clave = req.body.clave;

    const request = pool.request();

    try {
        request.input("IN_nombre", sqlcon.VarChar(64), nombre);
        request.input("IN_descripcion", sqlcon.VarChar(256), descripcion);
        request.input("IN_telefono", sqlcon.VarChar(16), telefono);
        request.input("IN_codigoSede", sqlcon.VarChar(4), codigoSede);
        request.input("IN_codigoCarrera", sqlcon.VarChar(4), codigoCarrera);
        request.input("IN_correo", sqlcon.VarChar(128), correo);
        request.input("IN_clave", sqlcon.VarChar(64), clave);
    } catch (error) {
        console.log(error);
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Asociaciones_Agregar", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.status(200).send("Agregado con éxito");
        }
    });
});

//descripcion: modifica los valores de la asociacion (validacion de correo es unicamente para "@estudiantec.cr")
//parametros: correoActual, nombre?, descripcion?, telefono?, codigosede?, codigocarrera?, correo?, clave?
//Retorna: NULL
//SP : AsociaTEC_SP_Asociaciones_Modificar
router.put("/modificar", (req, res) => {
    const correoActual = req.body.correoActual;
    const nombreNueva = req.body.nombreNueva;
    const descripcionNueva = req.body.descripcionNueva;
    const telefonoNueva = req.body.telefonoNueva;
    const codigoSedeNueva = req.body.codigoSedeNueva;
    const codigoCarreraNueva = req.body.codigoCarreraNueva;
    const correoNueva = req.body.correoNueva;
    const claveNueva = req.body.claveNueva;

    const request = pool.request();
    try {
        request.input("IN_correoActual", sqlcon.VarChar, correoActual);
        request.input("IN_nombreNueva", sqlcon.VarChar, nombreNueva);
        request.input("IN_descripcionNueva", sqlcon.VarChar, descripcionNueva);
        request.input("IN_telefonoNueva", sqlcon.VarChar, telefonoNueva);
        request.input("IN_codigoSedeNueva", sqlcon.VarChar, codigoSedeNueva);
        request.input(
            "IN_codigoCarreraNueva",
            sqlcon.VarChar,
            codigoCarreraNueva
        );
        request.input("IN_correoNueva", sqlcon.VarChar, correoNueva);
        request.input("IN_claveNueva", sqlcon.VarChar, claveNueva);
    } catch (error) {
        console.log(error);
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Asociaciones_Modificar", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.status(200).send("Modificado con éxito");
        }
    });
});

//descripcion: elimina una asociacion
//parametros: correo
//Retorna: NULL
//SP : AsociaTEC_SP_Asociaciones_Eliminar
router.delete("/eliminar", (req, res) => {
    const correo = req.query.correo;
    const request = pool.request();

    try {
        request.input("IN_correo", sqlcon.VarChar(128), correo);
    } catch (error) {
        return res.status(400).send("Identificador invalido");
    }

    request.execute("AsociaTEC_SP_Asociaciones_Eliminar", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.status(200).send("Eliminado con éxito");
        }
    });
});

module.exports = router;
