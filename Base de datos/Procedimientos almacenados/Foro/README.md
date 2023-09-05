# Descripción

Este directorio contiene procedimientos almacenados (_stored procedures_) utilizados para el foro.

*AsociaTEC_SP_Mensajes_Lista [uuidConversacion] (retornamos lista de de los mesajes  asociados) -> contenido, timestamp, autor:[nombre(estudiante/asociacion), carnet(null)]

*AsociaTEC_SP_Mensajes_Agregar [uuidConversacion, contenido ,correo] (agregamos el mensaje a la conversacion)

*AsociaTEC_SP_Mensajes_Eliminar [uuidConversacion] (eliminamos el mensaje seleccionado)

*AsociaTEC_SP_Conversaciones_Lista [titulo, tags] (devuelve lista de las conversaciones) -> titulo, identificador, timestamp, tags

*AsociaTEC_SP_Conversaciones_Agregar [correo, titulo, tags] (agregamos una conversacion y los tags asociados)

*AsociaTEC_SP_Conversaciones_Eliminar [uuidConversacion] (eliminamos todos los mensajes de la conversacion)
