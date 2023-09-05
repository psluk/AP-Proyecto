Pendientes
--falta unicamente implementar la cascada de borrados
AsociaTEC_SP_Asociaciones_Eliminar [correo] (desactiva a la asociacion)


Completados

    colaboradores
        AsociaTEC_SP_Solicitudes_Lista [correo, evento, acceptados(opcional)] (devuelve lista de las solicitudes) -> carnet, apellido1, apellido2, nombre
        AsociaTEC_SP_Solicitudes_Decidir[bool, carnet, evento, descripcion]
        AsociaTEC_SP_Colaboradores_Lista [correo, evento]  (devuelve la lista de los colaboradores)
        AsociaTEC_SP_Colaboradores_Eliminar [carnet, evento] (desactiva al estudiante como colaborador)
        AsociaTEC_SP_Colaboradores_Agregar [Evento, carnet] (se agrega el estudiante o se reactiva como colaborador)

    Asociaciones
        AsociaTEC_SP_Asociaciones_Lista [codigoSede(opcional), codigoCarrera(opcional)] (devuelve lista de las asociaciones) -> nombreAsocia, correo, nombreSede, codigoSede, nombreCarrera, codigoCarrera
        AsociaTEC_SP_Asociaciones_Modificar [carredaActual, sedeActual, nombreActual, carreda?, sede?, nombre?, descripcion?, telefono?, correo?, clave?] (modifica los valores)
        AsociaTEC_SP_Asociaciones_Detalles [correo] (devuelve todos los detalles) -> muchos datos
        AsociaTEC_SP_Asociaciones_Agregar [carreda, sede, nombre, descripcion, telefono, correo, clave] (lo reactiva si ya existe)


    Foro
        AsociaTEC_SP_Mensajes_Lista [uuid] (retornamos lista de de los mesajes  asociados) -> contenido, timestamp, nombre(estudiante/asociacion)
        AsociaTEC_SP_Mensajes_Agregar [uuid, contenido ,correo] (agregamos el mensaje) -> exito/fracaso
        AsociaTEC_SP_Mensajes_Eliminar [uuid] (eliminamos el mensaje) -> exito/fracaso
        AsociaTEC_SP_Conversaciones_Lista [Titulo, tags] (devuelve lista de) -> titulo, tags, timestamp
        AsociaTEC_SP_Conversaciones_Agregar [correo, titulo, tags] () -> exito/fracaso
        AsociaTEC_SP_Conversaciones_Eliminar [uuid] (eliminamos todos los mensajes de la conversacion) -> exito/fracaso




