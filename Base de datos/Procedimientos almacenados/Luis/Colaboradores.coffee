Colaboradores
AsociaTEC_SP_Solicitudes_Lista [nombre, sede, carrera, evento] (devuelve lista de las solicitudes) -> nombre, apellido1, apellido2, carnet

AsociaTEC_SP_Solicitudes_Decidir[ bool, nombre, apellido1, apellido2, carnet, evento] (decide si se accepta la peticion del estudiante; se llama a AsociaTEC_SP_Colaboradores_Agregar)
AsociaTEC_SP_Colaboradores_Lista [Asociacion, Evento]  (devuelve la lista de los colaboradores)
AsociaTEC_SP_Colaboradores_Agregar [Asociacion, Evento, nombre, apellido1, apellido2, carnet] (se agrega el estudiante o se reactiva como colaborador)
AsociaTEC_SP_Colaboradores_Eliminar [nombre, apellido1, apellido2, carnet] (desactiva al estudiante como colaborador)

Asociaciones
AsociaTEC_SP_Asociaciones_Lista [] (devuelve lista de las asociaciones) -> nombre, sede, carrera

AsociaTEC_SP_Asociaciones_Detalles [nombre, sede, carrera] (devuelve todos los detalles) -> carreda, sede, nombre, descripcion, telefono, correo
AsociaTEC_SP_Asociaciones_Agregar [carreda, sede, nombre, descripcion, telefono, correo, clave] (lo reactiva si ya existe)
AsociaTEC_SP_Asociaciones_Modificar [carredaActual, sedeActual, nombreActual, carreda?, sede?, nombre?, descripcion?, telefono?, correo?, clave?] (modifica los valores)
AsociaTEC_SP_Asociaciones_Eliminar [carreda, sede, nombre] (desactiva a la asociacion)

Foro
AsociaTEC_SP_Conversaciones_Lista [Titulo, tags] (devuelve lista de) -> titulo, tags, timestamp
AsociaTEC_SP_Conversaciones_Agregar_Asociacion [nombre, sede, carrera, titulo, tags] (llamamos al AsociaTEC_SP_Mensajes_Agregar_Asociacion) -> exito/fracaso
AsociaTEC_SP_Conversaciones_Agregar_Estudiante [nombre, apellido1, apellido2, carnet, titulo, tags] (llamamos al AsociaTEC_SP_Mensajes_Agregar_Estudiante) -> exito/fracaso
AsociaTEC_SP_Conversaciones_Eliminar [uuid] (eliminamos todos los mensajes de la conversacion) -> exito/fracaso
AsociaTEC_SP_Mensajes_Lista [uuid] (retornamos lista de de los mesajes  asociados) -> contenido, timestamp, nombre(estudiante/asociacion)
AsociaTEC_SP_Mensajes_Agregar_Asociacion [uuid, contenido ,nombre, sede, carrera] (agregamos el mensaje) -> exito/fracaso
AsociaTEC_SP_Mensajes_Agregar_Estudiante [uuid, contenido ,nombre, apellido1, apellido2, carnet] (agregamos el mensaje) -> exito/fracaso
AsociaTEC_SP_Mensajes_Eliminar [uuid] (eliminamos el mensaje) -> exito/fracaso


SP adicionales

lista de carreras 
lista de sedes

Colaboradores de actividades no existen en bd?

EstudiantesDeAsociacion no son colaboradores