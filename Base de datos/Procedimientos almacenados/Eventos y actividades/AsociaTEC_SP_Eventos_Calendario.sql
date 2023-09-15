--------------------------------------------------------------------------
-- Autor:       Fabián Vargas
-- Fecha:       2023-09-13
-- Descripción: Retorna los eventos agrupados por fechas
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Eventos_Calendario]
    -- Parámetros
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
    -- 

    BEGIN TRY

        -- VALIDACIONES
        --

        SELECT COALESCE(
            (
                SELECT
                CONVERT(DATE, E.fechaInicio) as 'fecha',
                (
                    SELECT
                        E2.[uuid],
                        E2.[titulo],
                        E2.[descripcion],
                        E2.[capacidad],
                        E2.[fechaFin],
                        E2.[fechaInicio],
                        E2.[lugar],
                        E2.[especiales],
                        C.[nombre] as'categoria'
                    FROM [dbo].[Eventos] E2
                    INNER JOIN [dbo].[Categorias] C
                    ON C.[id] = E2.[idCategoria]
                    WHERE E2.[eliminado] = 0
                    AND
                    CONVERT(DATE, E2.fechaInicio) = CONVERT(DATE, E.fechaInicio)
                    FOR JSON PATH
                ) as 'eventos'
                FROM [dbo].[Eventos] E
                WHERE E.[eliminado] = 0
                GROUP BY CONVERT(DATE, E.fechaInicio)
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