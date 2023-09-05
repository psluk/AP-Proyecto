Pendientes
--falta implementar la cascada de borrados
AsociaTEC_SP_Asociaciones_Eliminar [correo] (desactiva a la asociacion)


Faltan pruebas

*Revisar los filtros de tipo string en cada SP
*Revisar que retorne lo que ocupamos
*Revisar los agregar (para que sea imposible repetir informacion a no ser que este eliminada) (que los INSERT TO tenga correcto el formato)

    colaboradores
        
        AsociaTEC_SP_Colaboradores_Lista [correo, codigoSede, codigoCarrera, evento]  (devuelve la lista de los colaboradores)
        AsociaTEC_SP_Colaboradores_Eliminar [nombre, apellido1, apellido2, carnet] (desactiva al estudiante como colaborador)
        AsociaTEC_SP_Colaboradores_Agregar [Evento, carnet] (se agrega el estudiante o se reactiva como colaborador)
        
        


    Asociaciones
        AsociaTEC_SP_Asociaciones_Lista [sede(opcional), carrera(opcional),] (devuelve lista de las asociaciones) -> nombre, sede, carrera, correo
        AsociaTEC_SP_Asociaciones_Detalles [nombre, sede, carrera] (devuelve todos los detalles) -> carreda, sede, nombre, descripcion, telefono, correo
        AsociaTEC_SP_Asociaciones_Agregar [carreda, sede, nombre, descripcion, telefono, correo, clave] (lo reactiva si ya existe)
        AsociaTEC_SP_Asociaciones_Modificar [carredaActual, sedeActual, nombreActual, carreda?, sede?, nombre?, descripcion?, telefono?, correo?, clave?] (modifica los valores)

    Foro

        AsociaTEC_SP_Mensajes_Lista [uuid] (retornamos lista de de los mesajes  asociados) -> contenido, timestamp, nombre(estudiante/asociacion)
        AsociaTEC_SP_Mensajes_Agregar [uuid, contenido ,correo] (agregamos el mensaje) -> exito/fracaso
        AsociaTEC_SP_Mensajes_Eliminar [uuid] (eliminamos el mensaje) -> exito/fracaso
        AsociaTEC_SP_Conversaciones_Lista [Titulo, tags] (devuelve lista de) -> titulo, tags, timestamp
        AsociaTEC_SP_Conversaciones_Agregar [correo, titulo, tags] () -> exito/fracaso
        AsociaTEC_SP_Conversaciones_Eliminar [uuid] (eliminamos todos los mensajes de la conversacion) -> exito/fracaso


Completados

    colaboradores
        AsociaTEC_SP_Solicitudes_Lista [correo, evento, acceptados(opcional)] (devuelve lista de las solicitudes) -> carnet, apellido1, apellido2, nombre
        AsociaTEC_SP_Solicitudes_Decidir[bool, carnet, evento, descripcion]