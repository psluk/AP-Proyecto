--------------------------------------------------------------------------
-- Autor:       Luis Fernando Molina
-- Fecha:       2023-09-03
-- Descripci�n: agregamos un mensaje procedente de un usuario a una conversacion 
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Mensajes_Agregar]
    -- Par�metros
    @IN_identificadorConversacion UNIQUEIDENTIFIER,
	@IN_contenido VARCHAR(MAX),
	@IN_correo VARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACI�N DE VARIABLES
	DECLARE @usarIDUsuario INT = NULL
	DECLARE @usarIDConversacion INT = NULL

    BEGIN TRY

		--REALIZAR LAS VALIDACIONES

        -- VALIDACIONES

		IF (LTRIM(RTRIM(@IN_identificadorConversacion)) = '')
        BEGIN
            -- Identificador vacio
            RAISERROR('El identificador esta vacio.', 16, 1);
        END;

		SELECT @usarIDConversacion = C.[id]
		FROM  [dbo].[Conversaciones] C
		WHERE C.[uuid] = @IN_identificadorConversacion
		AND C.[eliminado] = 0

		IF(@usarIDConversacion IS NULL)
		BEGIN
			-- Identificador inexistente
            RAISERROR('La conversacion que se busca no existe', 16, 1);
		END;

		IF (LTRIM(RTRIM(@IN_correo)) = '')
        BEGIN
            -- correo vacio
            RAISERROR('El correo esta vacio.', 16, 1);
        END;

		SELECT @usarIDUsuario = U.[id]
		FROM [dbo].[Usuarios] U
		WHERE U.[correo] = @IN_correo
		AND U.[eliminado] = 0

		IF(@usarIDUsuario IS NULL)
		BEGIN
			-- Identificador inexistente
            RAISERROR('El usuario con el correo "%s" no existe', 16, 1, @IN_correo);
		END;


		IF (LTRIM(RTRIM(@IN_contenido)) = '')
        BEGIN
            -- mensaje vacio
            RAISERROR('El mensaje esta vacio.', 16, 1);
        END;


		-- INICIO DE LA TRANSACCIÓN
        IF @@TRANCOUNT = 0
        BEGIN
            SET @transaccionIniciada = 1;
            BEGIN TRANSACTION;
        END;

        INSERT INTO [dbo].[Mensajes]
        (
            [idUsuario], 
			[idConversacion], 
			[uuid], 
			[contenido], 
			[timestamp], 
			[eliminado]
        )
        VALUES
        (
            @usarIDUsuario,
			@usarIDConversacion,
            NEWID(),
            @IN_contenido,
            GETDATE(),
            0
        )

        -- COMMIT DE LA TRANSACCIÓN
        IF @transaccionIniciada = 1
        BEGIN
            COMMIT TRANSACTION;
        END;

		SELECT 1;

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