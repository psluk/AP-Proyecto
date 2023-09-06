--------------------------------------------------------------------------
-- Autor:       Fabián Vargas
-- Fecha:       23-09-03
-- Descripción: Retorna la lista de recursos de una actividad
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Recursos_Lista]
    @IN_uuid UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
    DECLARE @ID_Actividad INT = NULL

    BEGIN TRY

        -- VALIDACIONES
        SELECT @ID_Actividad = A.[id]
        FROM [dbo].[Actividades] A
        WHERE A.[uuid] = @IN_uuid
        AND A.[eliminado] = 0

        IF @ID_Actividad IS NULL
        BEGIN
            RAISERROR('No existe la actividad consultada', 16, 1)
        END


        SELECT COALESCE(
            (
                SELECT R.[nombre],
                       D.[cantidad]
                FROM [dbo].[RecursosDeActivdad] D
                INNER JOIN [dbo].[Recursos] R
                ON R.[id] = D.[idRecurso]
                WHERE D.[idActividad] = @ID_Actividad
                AND D.[eliminado] = 0
                FOR JSON PATH
            ),
            '[]'
        ) as 'resultados'
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