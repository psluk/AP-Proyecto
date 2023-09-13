const express = require("express");
const router = express.Router();
const { pool, sqlcon } = require("../settings/database.js");
const bcrypt = require("bcrypt");
const manejarError = require("../settings/errores.js");
const estaAutenticado = require("../settings/autenticado.js");

// Para el hash de las contraseñas
const saltRounds = 10;

/**
 * Método GET
 * Retorna la lista de estudiantes
 * Puede ser filtrada por código de carrera o sede
 */
router.get("/", (req, res) => {
    if (!estaAutenticado(req, true)) {
        return res.status(403).send({ mensaje: "Acceso denegado" });
    }

    const nombre = req.query.nombre;
    const carnet = req.query.carnet;
    const codigoCarrera = req.query.codigoCarrera;
    const codigoSede = req.query.codigoSede;

    const request = pool.request();

    try {
        if (nombre) {
            request.input("IN_nombre", sqlcon.VarChar(64), nombre);
        }

        if (carnet) {
            request.input("IN_carnet", sqlcon.Int, carnet);
        }

        if (codigoCarrera) {
            request.input("IN_codigoCarrera", sqlcon.VarChar(4), codigoCarrera);
        }

        if (codigoSede) {
            request.input("IN_codigoSede", sqlcon.VarChar(4), codigoSede);
        }
    } catch (error) {
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Estudiantes_Lista", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.setHeader("Content-Type", "application/json").send(
                result.recordset[0]["results"]
            );
        }
    });
});

/**
 * Método GET
 * Retorna los detalles de un estudiante
 * Necesita un número de carné
 */
router.get("/detalles", (req, res) => {
    const carnet = req.query.carnet;

    if (!estaAutenticado(req, true, undefined, carnet)) {
        return res.status(403).send({ mensaje: "Acceso denegado" });
    }

    const request = pool.request();

    try {
        if (!carnet) {
            throw new Error("No se brindó un número de carné");
        }

        request.input("IN_carnet", sqlcon.Int, carnet);
    } catch (error) {
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Estudiantes_Detalles", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.setHeader("Content-Type", "application/json").send(
                result.recordset[0]["results"]
            );
        }
    });
});

/**
 * Método POST
 * Agrega un estudiante
 */
router.post("/agregar", async (req, res) => {
    const {
        correo,
        clave,
        codigoCarrera,
        codigoSede,
        nombre,
        apellido1,
        apellido2,
        carnet,
    } = req.body;

    const request = pool.request();

    try {
        request.input("IN_correo", sqlcon.VarChar(128), correo);
        request.input("IN_codigoCarrera", sqlcon.VarChar(4), codigoCarrera);
        request.input("IN_codigoSede", sqlcon.VarChar(4), codigoSede);
        request.input("IN_nombre", sqlcon.VarChar(32), nombre);
        request.input("IN_apellido1", sqlcon.VarChar(16), apellido1);
        request.input("IN_apellido2", sqlcon.VarChar(16), apellido2);
        request.input("IN_carnet", sqlcon.Int, carnet);

        if (clave) {
            let claveConHash;

            try {
                claveConHash = await bcrypt.hash(clave, saltRounds);
            } catch (error) {
                console.log(error);
                return res
                    .status(500)
                    .send({ mensaje: "Error interno del servidor" });
            }

            request.input("IN_clave", sqlcon.VarChar(64), claveConHash);
        } else {
            throw new Error("Contraseña vacía");
        }
    } catch (error) {
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Estudiantes_Agregar", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            return res.status(200).send({ mensaje: "Registrado con éxito" });
        }
    });
});

/**
 * Método PUT
 * Modifica un estudiante
 */
router.put("/modificar", async (req, res) => {
    if (!estaAutenticado(req, true)) {
        return res.status(403).send({ mensaje: "Acceso denegado" });
    }

    const {
        carnet,
        correo,
        clave,
        codigoCarrera,
        codigoSede,
        nombre,
        apellido1,
        apellido2,
        carnetNuevo,
    } = req.body;

    const request = pool.request();

    try {
        request.input("IN_carnet", sqlcon.Int, carnet);
        request.input("IN_correo", sqlcon.VarChar(128), correo);
        request.input("IN_codigoCarrera", sqlcon.VarChar(4), codigoCarrera);
        request.input("IN_codigoSede", sqlcon.VarChar(4), codigoSede);
        request.input("IN_nombre", sqlcon.VarChar(32), nombre);
        request.input("IN_apellido1", sqlcon.VarChar(16), apellido1);
        request.input("IN_apellido2", sqlcon.VarChar(16), apellido2);
        request.input("IN_carnetNuevo", sqlcon.Int, carnetNuevo);

        if (clave) {
            let claveConHash;

            try {
                claveConHash = await bcrypt.hash(clave, saltRounds);
            } catch (error) {
                console.log(error);
                return res
                    .status(500)
                    .send({ mensaje: "Error interno del servidor" });
            }

            request.input("IN_clave", sqlcon.VarChar(64), claveConHash);
        } else {
            request.input("IN_clave", sqlcon.VarChar(64), "");
        }
    } catch (error) {
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Estudiantes_Modificar", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            return res.status(200).send({ mensaje: "Modificado con éxito" });
        }
    });
});

/**
 * Método DELETE
 * Elimina un estudiante
 */
router.delete("/eliminar", (req, res) => {
    if (!estaAutenticado(req, true)) {
        return res.status(403).send({ mensaje: "Acceso denegado" });
    }

    const carnet = req.query.carnet;

    const request = pool.request();

    try {
        request.input("IN_carnet", sqlcon.Int, carnet);
    } catch (error) {
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Estudiantes_Eliminar", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            return res.status(200).send({ mensaje: "Eliminado con éxito" });
        }
    });
});

module.exports = router;
