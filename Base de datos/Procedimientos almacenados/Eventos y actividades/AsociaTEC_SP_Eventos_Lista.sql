--------------------------------------------------------------------------
-- Autor:       Fabián Vargas
-- Fecha:       23-08-30
-- Descripción: Retorna la lista de eventos
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Eventos_Lista]
    @IN_CodigoCarrera VARCHAR(4) = NULL
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccion_iniciada BIT = 0;

    DECLARE @ID_Asociacion INT = NULL;

    BEGIN TRY

         -- Busca el ID de la asociacion a la que corresponde los eventos
        SELECT  @ID_Asociacion = COALESCE(A.[id], NULL)
        FROM    [dbo].[Asociaciones] A
        INNER JOIN [dbo].[Carreras] C
		ON C.[id] = A.[idCarrera]
		WHERE C.[codigo] = @IN_CodigoCarrera

		IF(@IN_CodigoCarrera IS NOT NULL AND @ID_Asociacion IS NULL)
		BEGIN
			RAISERROR('No existe eventos relacionados a esa carrera."%s"', 16, 1, @IN_CodigoCarrera);
		END

        IF(@ID_Asociacion IS NOT NULL)
			BEGIN
				SELECT COALESCE(
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
					WHERE E.[idAsociacion] = @ID_Asociacion
					AND E.[eliminado] = 0
					FOR JSON PATH
					),
					'[]'
				) as 'resultados'			
			END
		ELSE
			BEGIN
				SELECT COALESCE(
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
					WHERE E.[eliminado] = 0
					FOR JSON PATH
					),
					'[]'
				) as 'resultados'
			END

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