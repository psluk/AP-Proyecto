# Descripción

Este directorio contiene procedimientos almacenados (_stored procedures_) utilizados para los colaboradores.

*AsociaTEC_SP_Solicitudes_Lista [correo, uuidEvento, acceptados?] (devuelve lista de las solicitudes) -> carnet, apellido1, apellido2, nombre

*AsociaTEC_SP_Solicitudes_Decidir[bool, carnet, uuidEvento, descripcion]

*AsociaTEC_SP_Colaboradores_Lista [correo, uuidEvento]  (devuelve la lista de los colaboradores) -> carnet, apellido1, apellido2, nombre

*AsociaTEC_SP_Colaboradores_Eliminar [carnet, uuidEvento] (desactiva al estudiante como colaborador)

*AsociaTEC_SP_Colaboradores_Agregar [carnet, descripcion, uuidEvento] (se agrega el estudiante o se reactiva como colaborador) (agregar posible modificacion de la descripccion ya existente cuando reactivamos)
