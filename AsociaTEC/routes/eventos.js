const express = require("express");
const router = express.Router();
const { pool, sqlcon } = require("../settings/database.js");
const manejarError = require("../settings/errores.js");
const estaAutenticado = require("../settings/autenticado.js")

/**
 * Metodo GET
 * Retorna la lista de eventos
 * Puede ser filtrada por codigo de carrera y/o codigo de sede
 */
router.get("/",(req, res) =>{

    const codigoCarrera =  req.query.codigoCarrera;
    const codigoSede = req.query.codigoSede;

    const request =  pool.request();

    if(codigoCarrera){
        request.input('IN_CodigoCarrera', sqlcon.VarChar, codigoCarrera)
    }

    if(codigoSede){
        request.input('IN_CodigoSede', sqlcon.VarChar, codigoSede)
    }

    request.execute("AsociaTEC_SP_Eventos_Lista",(error, result)=>{
        if(error){
            manejarError(res,error);
        }
        else{
            
            res.setHeader('Content-Type', 'application/json')
            .send(result.recordset[0]["results"])
        }
    })
});

/**
 * Metodo GET
 * Retorna los detalles de un evento
 */
router.get("/evento",(req, res)=>{

})

module.exports = router;