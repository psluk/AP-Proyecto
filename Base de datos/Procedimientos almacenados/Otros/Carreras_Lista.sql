--------------------------------------------------------------------------
-- Autor:       Paúl Rodríguez García
-- Fecha:       2023-09-02
-- Descripción: Devuelve la lista de carreras del sistema.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Carreras_Lista]
    -- Parámetros
    @IN_sede    VARCHAR(4)
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
    DECLARE @idSede INT = NULL;

    BEGIN TRY

        -- VALIDACIONES
        SELECT  @idSede = S.[id]
        FROM    [dbo].[Sedes] S
        WHERE   S.[codigo] = @IN_sede;

        IF @idSede IS NULL
        BEGIN
            RAISERROR('No existe ninguna sede con el código "%s"', 16, 1, @IN_sede);
        END;

        SELECT COALESCE(
            (SELECT C.[codigo]  AS 'codigo',
                    C.[nombre]  AS 'nombre'
            FROM    [dbo].[Carreras] C
            WHERE   C.[idSede] = @idSede
            ORDER BY C.[nombre] ASC
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