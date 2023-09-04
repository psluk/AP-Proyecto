--------------------------------------------------------------------------
-- Autor:       Luis Fernando Molina
-- Fecha:       2023-09-04
-- Descripci�n: eliminamos una nueva conversacion y sus mensajes asociados
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Conversaciones_Eliminar]
    -- Par�metros
	@IN_identificadorConversacion UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACI�N DE VARIABLES



    BEGIN TRY

		--REALIZAR LAS VALIDACIONES

        -- VALIDACIONES

		IF (LTRIM(RTRIM(@IN_identificadorConversacion)) = '')
        BEGIN
            -- identificador vacio
            RAISERROR('la conversacion no se encontro.', 16, 1);
        END;

		IF NOT EXISTS (SELECT 1 
				   FROM [dbo].[Conversaciones] C
				   WHERE C.[uuid] = @IN_identificadorConversacion) 
		BEGIN
			RAISERROR('la conversacion a borrar no se encontro.', 16, 1);
		END;



		-- INICIO DE LA TRANSACCIÓN
        IF @@TRANCOUNT = 0
        BEGIN
            SET @transaccionIniciada = 1;
            BEGIN TRANSACTION;
        END;

		--borrado de EtiquetasDeConversacion
		UPDATE EdC
		SET EdC.[eliminado] = 1
		FROM [dbo].[EtiquetasDeConversacion] EdC
		INNER JOIN [dbo].[Conversaciones] C
			ON C.[id] = EdC.[idConversacion]
		WHERE C.[uuid] = @IN_identificadorConversacion

		--borrado de mensajes
		UPDATE M
		SET M.[eliminado] = 1
		FROM [dbo].[Mensajes] M
		INNER JOIN [dbo].[Conversaciones] C
			ON C.[id] = M.[idConversacion]
		WHERE C.[uuid] = @IN_identificadorConversacion

		-- borrado de conversacion
		UPDATE C
		SET C.[eliminado] = 1
		FROM [dbo].[Conversaciones] C
		WHERE C.[uuid] = @IN_identificadorConversacion

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