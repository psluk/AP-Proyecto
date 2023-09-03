--------------------------------------------------------------------------
-- Autor:       Fabián Vargas
-- Fecha:       23-09-02
-- Descripción: Elimina un evento
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Eventos_Eliminar]
    @IN_uuid UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccion_iniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
    -- 

    BEGIN TRY

        -- VALIDACIONES
        --

        IF NOT EXISTS(
            SELECT 1
            FROM [dbo].[Eventos] E
            WHERE E.[uuid] = @IN_uuid
            AND E.[eliminado] = 0
        )
        BEGIN
            DECLARE @uuid_varchar VARCHAR(36)= (SELECT CONVERT(NVARCHAR(36), @IN_uuid))
            RAISERROR('No existe ningún evento con el uuid %s.', 16, 1, @uuid_varchar);
        END

        -- INICIO DE LA TRANSACCIÓN
        IF @@TRANCOUNT = 0
        BEGIN
            SET @transaccion_iniciada = 1;
            BEGIN TRANSACTION;
        END;

        UPDATE E
        SET E.[eliminado] = 1
        FROM [dbo].[Eventos] E
        WHERE E.[uuid] = @IN_uuid

        -- COMMIT DE LA TRANSACCIÓN
        IF @transaccion_iniciada = 1
        BEGIN
            COMMIT TRANSACTION;
        END;

    END TRY
    BEGIN CATCH

        SET @ErrorNumber = ERROR_NUMBER();
        SET @ErrorSeverity = ERROR_SEVERITY();
        SET @ErrorState = ERROR_STATE();
        SET @Message = ERROR_MESSAGE();

        IF @transaccion_iniciada = 1
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