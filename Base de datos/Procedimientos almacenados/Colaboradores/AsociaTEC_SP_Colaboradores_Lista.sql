--------------------------------------------------------------------------
-- Autor:       Luis Fernando Molina
-- Fecha:       2023-09-02
-- Descripci�n: Retorna la lista de los estudiantes que son actualemnte
--              colaboradores de un evento.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Colaboradores_Lista]
    -- Par�metros
    @IN_Correo VARCHAR(128),
    @IN_identificadorEvento UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACI�N DE VARIABLES
	DECLARE @tipoasociacion VARCHAR(16) = 'Asocia%';

    BEGIN TRY

        -- VALIDACIONES

		IF (LTRIM(RTRIM(@IN_Correo)) = '')
        BEGIN
            -- correo vacio
            RAISERROR('Parametro [correo] es vacio.', 16, 1)
        END;
    
		IF (LTRIM(RTRIM(@IN_identificadorEvento)) = '')
        BEGIN
            -- identificadorEvento vacio
            RAISERROR('Parametro [identificadorEvento] es vacio.', 16, 1)
        END;


		SELECT COALESCE(
            (SELECT E.[carnet]      AS 'carnet',
                    E.[nombre]      AS 'nombre',
                    E.[apellido1]   AS 'apellido1',
                    E.[apellido2]   AS 'apellido2'
			FROM [dbo].[ColaboradoresDeEvento] CdE
			INNER JOIN [dbo].[Estudiantes] E
				ON E.[id] = Cde.[idEstudiante]
			INNER JOIN [dbo].[Eventos] Eve
				ON Eve.[id] = CdE.[idEventos]
			INNER JOIN [dbo].[Asociaciones] A
			    ON  A.[id] = Eve.[idAsociacion]
			INNER JOIN [dbo].[Usuarios] U
				ON U.[id] = A.[idUsuario]
			INNER JOIN [dbo].[TiposUsuario] Tpu
				ON Tpu.[id] = U.[idTipoUsuario]
			
			WHERE CdE.[eliminado] = 0 --no eliminados (ColaboradoresDeEvento)
			AND E.[eliminado] = 0 --no eliminados (estudiantes)
			AND Eve.[eliminado] = 0 --no eliminados (eventos)
			AND A.[eliminado] = 0 --no eliminados (asociaciones)
			AND Tpu.[nombre] LIKE @tipoasociacion --que sea tipo asociacion
			AND U.[correo] = LTRIM(RTRIM(@IN_Correo)) -- identificador de asociacion
			AND U.[eliminado] = 0 --no eliminados (usuario)
            ORDER BY E.[apellido1], E.[apellido2], E.[nombre] ASC
            FOR JSON PATH),
		'[]'    -- Por defecto, si no hay resultados, no retorna nada, entonces esto hace
                -- que el JSON retornado sea un arreglo vac�o
        ) AS 'results';

    END TRY
    BEGIN CATCH

        SET @ErrorNumber = ERROR_NUMBER();
        SET @ErrorSeverity = ERROR_SEVERITY();
        SET @ErrorState = ERROR_STATE();
        SET @Message = ERROR_MESSAGE();

        IF @transaccionIniciada = 1
        BEGIN
            ROLLBACK;
        END;

        IF @ErrorNumber != 50000
        BEGIN
            -- Si no es un error personalizado, se registra el error
            INSERT INTO [dbo].[Errores]
            VALUES (
                SUSER_NAME(),
                ERROR_NUMBER(),
                ERROR_STATE(),
                ERROR_SEVERITY(),
                ERROR_LINE(),
                ERROR_PROCEDURE(),
                ERROR_MESSAGE(),
                GETUTCDATE()
            );
        END;

        RAISERROR('%s - Error Number: %i', 
            @ErrorSeverity, @ErrorState, @Message, @ErrorNumber);

    END CATCH;
END;