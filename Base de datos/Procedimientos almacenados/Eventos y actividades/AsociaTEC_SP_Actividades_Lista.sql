--------------------------------------------------------------------------
-- Autor:       Fabián Vargas
-- Fecha:       23-09-03
-- Descripción: Retorna la lista de actividades de un evento
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Actividades_Lista]
    @IN_uuid UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
    DECLARE @ID_Evento INT = NULL;

    BEGIN TRY

        -- VALIDACIONES
        SELECT @ID_Evento = E.[id]
        FROM [dbo].[Eventos] E
        WHERE E.[uuid] = @IN_uuid
        AND E.[eliminado] = 0

        IF @ID_Evento IS NULL
        BEGIN
            DECLARE @uuid_varchar VARCHAR(36)= (SELECT CONVERT(NVARCHAR(36), @IN_uuid))
            RAISERROR('No existe ningún evento con el uuid %s.', 16, 1, @uuid_varchar) 
        END
        
        SELECT COALESCE(
            (SELECT 
                A.[uuid],
                A.[nombre],
                A.[lugar],
                A.[fechaInicio],
                A.[fechaFin]
            FROM [dbo].[Actividades] A
            WHERE A.[idEvento] = @ID_Evento
            AND A.[eliminado] = 0
            FOR JSON PATH),
            '[]'
        ) as 'results'

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