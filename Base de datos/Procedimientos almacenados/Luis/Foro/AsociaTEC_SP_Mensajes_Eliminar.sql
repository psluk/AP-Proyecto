--------------------------------------------------------------------------
-- Autor:       Luis Fernando Molina
-- Fecha:       2023-09-04
-- Descripci�n: eliminamos un mensajes de una conversacion
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Mensajes_Eliminar]
    -- Par�metros
	@IN_identificadorMensaje UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACI�N DE VARIABLES


    BEGIN TRY

        -- VALIDACIONES

		IF (LTRIM(RTRIM(@IN_identificadorMensaje)) = '')
        BEGIN
            -- mensaje vacio
            RAISERROR('el mensaje no se encontro.', 16, 1);
        END;

		IF NOT EXISTS (SELECT 1 
				   FROM [dbo].[Mensajes] M
				   WHERE M.[uuid] = @IN_identificadorMensaje
				   AND M.[eliminado] = 0) 
		BEGIN
			RAISERROR('El mensaje a borrar no se encontro.', 16, 1);
		END;



		-- INICIO DE LA TRANSACCIÓN
        IF @@TRANCOUNT = 0
        BEGIN
            SET @transaccionIniciada = 1;
            BEGIN TRANSACTION;
        END;

		--borrado de mensajes
		UPDATE M
		SET M.[eliminado] = 1
		FROM [dbo].[Mensajes] M
		WHERE M.[uuid] = @IN_identificadorMensaje


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