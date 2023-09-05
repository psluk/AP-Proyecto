# Descripción

Este directorio contiene procedimientos almacenados (_stored procedures_) utilizados para las asociaciones.

*AsociaTEC_SP_Asociaciones_Lista [codigoSede?, codigoCarrera?] (devuelve lista de las asociaciones) -> nombreAsocia, correo, nombreSede, codigoSede, nombreCarrera, codigoCarrera

*AsociaTEC_SP_Asociaciones_Modificar [correoActual, nombre?, descripcion?, telefono?, codigosede?, codigocarrera?, correo?, clave?] (modifica los valores)

*AsociaTEC_SP_Asociaciones_Detalles [correo] (devuelve todos los detalles) -> asociacion: [nombre, correo, telefono, descripcion], carrera: [nombre, codigo], sede:[nombre, codigo]

*AsociaTEC_SP_Asociaciones_Eliminar [correo] (desactiva a la asociacion)

*AsociaTEC_SP_Asociaciones_Agregar [nombre, descripcion, telefono, codigoCarreda, codigoSede,  correo, clave] (lo reactiva si ya existe (unicamente al usuario y asociacion))