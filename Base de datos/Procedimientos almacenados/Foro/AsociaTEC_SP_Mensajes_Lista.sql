--------------------------------------------------------------------------
-- Autor:       Luis Fernando Molina
-- Fecha:       2023-09-03
-- Descripción: Retorna la lista de los mensajes de las conversaciones
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Mensajes_Lista]
    -- Parámetros
    @IN_identificadorConversacion UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
	DECLARE @usarTipoUsuarioAso VARCHAR(16) = 'Asocia%'
	DECLARE @usarTipoUsuarioEst VARCHAR(16) = 'Estudi%'

    BEGIN TRY

        -- VALIDACIONES

		IF (LTRIM(RTRIM(@IN_identificadorConversacion)) = '')
        BEGIN
            -- Identificador vacio
            RAISERROR('El identificador esta vacio.', 16, 1);
        END;

		IF NOT EXISTS( SELECT 1 
				 FROM [dbo].[Conversaciones] C
				 WHERE C.[uuid] = @IN_identificadorConversacion
				 AND C.[eliminado] = 0)
		BEGIN
			-- Identificador inexistente
            RAISERROR('No existe el identificadorConversacion', 16, 1);
		END;

		SELECT COALESCE(
            (SELECT M.[contenido] AS 'contenido',
					M.[timestamp] AS 'timestamp',
					M.[uuid] AS 'identificador',
					Case WHEN Tu.[nombre] LIKE @usarTipoUsuarioAso THEN A.[nombre]
						WHEN Tu.[nombre] LIKE @usarTipoUsuarioEst THEN E.[nombre]
						ELSE 'upps' END AS 'autor.nombre',
					Case WHEN Tu.[nombre] LIKE @usarTipoUsuarioAso THEN NULL
						WHEN Tu.[nombre] LIKE @usarTipoUsuarioEst THEN E.[carnet]
						ELSE 'upps' END AS 'autor.carnet'
			FROM [dbo].[Mensajes] M
			INNER JOIN [dbo].[Conversaciones] C
				ON C.[id] = M.[idConversacion]
			INNER JOIN [dbo].[Usuarios] U
				ON U.[id] = M.[idUsuario]
			INNER JOIN [dbo].[TiposUsuario] Tu
				ON Tu.[id] = U.[idTipoUsuario]
			INNER JOIN [dbo].[Estudiantes] E
				ON E.[idUsuario] = M.[idUsuario]
			INNER JOIN [dbo].[Asociaciones] A
				ON A.[idUsuario] = M.[idUsuario]
			WHERE M.[eliminado] = 0
			AND U.[eliminado] = 0
			AND E.[eliminado] = 0
			AND A.[eliminado] = 0
			AND C.[uuid] = @IN_identificadorConversacion
			ORDER BY M.[timestamp] ASC
            FOR JSON PATH),
		'[]'    -- Por defecto, si no hay resultados, no retorna nada, entonces esto hace
                -- que el JSON retornado sea un arreglo vacío
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