--------------------------------------------------------------------------
-- Autor:       Luis Fernando Molina
-- Fecha:       2023-09-03
-- Descripción: Retorna la lista de las asociaciones segun parametros de busqueda
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Asociaciones_Lista]
    -- Parámetros
    @IN_codigoSede VARCHAR(4) = NULL,
    @IN_codigoCarrera VARCHAR(4) = NULL
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
	DECLARE @usarSede BIT = 0;
	DECLARE @usarCarrera BIT = 0;

    BEGIN TRY

		--REALIZAR LAS VALIDACIONES

        -- VALIDACIONES

		IF NOT ((LTRIM(RTRIM(@IN_codigoSede)) = '') OR (@IN_codigoSede IS NULL))
        BEGIN
            -- CodigoSede se usara como filtro
            SET @usarSede = 1
        END;

		IF NOT ((LTRIM(RTRIM(@IN_codigoCarrera)) = '') OR (@IN_codigoCarrera IS NULL))
        BEGIN
            -- CodigoSede se usara como filtro
            SET @usarCarrera = 1
        END;


		SELECT COALESCE(
            (SELECT  A.[nombre]		AS 'asociacion.nombre',
					U.[correo]		AS 'asociacion.correo',
					C.[codigo]      AS 'carrera.codigo', 
			        C.[nombre]      AS 'carrera.nombre',
			        S.[codigo]      AS 'sede.codigo',
			        S.[nombre]      AS 'sede.nombre'
			FROM [dbo].[Asociaciones] A
			INNER JOIN [dbo].[Carreras] C
				ON C.[id] = A.[idCarrera]
			INNER JOIN [dbo].[Sedes] S
				ON S.[id] = C.[idSede]
			INNER JOIN [dbo].[Usuarios] U
				ON U.[id] = A.[idUsuario]
			WHERE (@usarCarrera = 0 
				   OR C.[codigo] = LTRIM(RTRIM(@IN_codigoCarrera)))
			AND (@usarSede = 0 
				 OR S.[codigo] = LTRIM(RTRIM(@IN_codigoSede)))
			AND A.[eliminado] = 0
            ORDER BY S.[nombre], C.[nombre], A.[nombre] ASC
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