--------------------------------------------------------------------------
-- Autor:       Fabián Vargas
-- Fecha:       23-08-30
-- Descripción: Retorna la lista de eventos
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Eventos_Lista]
    @IN_CodigoCarrera VARCHAR(4) = NULL,
    @IN_CodigoSede VARCHAR(4) = NULL
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccion_iniciada BIT = 0;

    DECLARE @ID_Carrera INT = NULL;
    DECLARE @ID_Sede INT = NULL;

    BEGIN TRY

        SELECT @ID_Sede  = S.[id]
        FROM [dbo].[Sedes] S
        WHERE S.[codigo] = @IN_CodigoSede

        IF @ID_Sede IS NULL AND @IN_CodigoSede IS NOT NULL
        BEGIN
            RAISERROR('No existe la sede: %s', 16, 1, @IN_CodigoSede)
        END

        SELECT @ID_Carrera = C.[id]
        FROM [dbo].[Carreras] C
        WHERE C.[codigo] = @IN_CodigoCarrera
        AND (@IN_CodigoSede IS NULL 
        OR C.[idSede] = @ID_Sede) 

        IF @ID_Carrera IS NULL AND @IN_CodigoCarrera IS NOT NULL
        BEGIN
            RAISERROR('No existe la carrera: %s', 16, 1, @IN_CodigoCarrera)
        END

        SELECT COALESCE
        (
            (SELECT E.[uuid],
            E.[titulo],
            E.[descripcion],
            E.[capacidad],
            E.[fechaFin],
            E.[fechaInicio],
            E.[lugar],
            E.[especiales],
            C.[nombre]
            FROM [dbo].[Eventos] E
            INNER JOIN [dbo].[Categorias] C
            ON C.[id] = E.[idCategoria]
            INNER JOIN [dbo].[Asociaciones] A
            ON A.[id] = E.[idAsociacion]
            INNER JOIN [dbo].[Carreras] K
            ON K.[id] = A.[idCarrera]
            WHERE (
                @IN_CodigoCarrera IS NULL
                OR
                K.[codigo] = @IN_CodigoCarrera
            ) AND (
                @IN_CodigoSede IS NULL
                OR
                K.[idSede] = @ID_Sede
            )
            AND E.[eliminado] = 0
            FOR JSON PATH
            ),
            '[]'
        ) as 'results'			


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