--------------------------------------------------------------------------
-- Autor:       Luis Fernando Molina
-- Fecha:       2023-09-03
-- Descripci�n: Retorna los detalles de una asociacion
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Asociaciones_Detalles]
    -- Par�metros
    @IN_codigoSede VARCHAR(4),
    @IN_codigoCarrera VARCHAR(4),
	@IN_correo VARCHAR(128)
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

		IF (LTRIM(RTRIM(@IN_codigoSede)) = '')
        BEGIN
			--el codigo de sede es vacio
            RAISERROR('El codigo de sede esta vacio.', 16, 1);
        END;

		IF (LTRIM(RTRIM(@IN_codigoCarrera)) = '')
        BEGIN
			--el codigo de carrera es vacio
            RAISERROR('El codigo de carrera esta vacio.', 16, 1);
        END;

		IF (LTRIM(RTRIM(@IN_correo)) = '') OR NOT EXISTS (SELECT 1 
													  FROM [dbo].[Usuarios] U 
													  INNER JOIN [dbo].[TiposUsuario] Tu 
														ON Tu.[id] = U.[id] 
													  WHERE U.[correo] = @IN_correo
													  AND Tu.[nombre] LIKE 'Asoci%' 
													  AND U.[eliminado] = 0)
        BEGIN
			--el identificador de la asociacion viene vacio
            RAISERROR('no existe ninguna asociacion con ese correo.', 16, 1)
        END;

		SELECT COALESCE(
            (SELECT	A.[nombre]		AS 'asociacion.nombre',
				U.[correo]		AS 'asociacion.correo',
				A.[telefono]	AS 'asociacion.telefono',
				A.[descripcion]	AS 'asociacion.descripcion',
			    C.[nombre]      AS 'carrera.nombre',
			    S.[nombre]      AS 'sede.nombre'	
			FROM [dbo].[Asociaciones] A
			INNER JOIN [dbo].[Carreras] C
				ON C.[id] = A.[idCarrera]
			INNER JOIN [dbo].[Sedes] S
				ON S.[id] = C.[idSede]
			INNER JOIN [dbo].[Usuarios] U
				ON U.[id] = A.[idUsuario]
			WHERE U.[correo] = @IN_correo
			AND A.[eliminado] = 0
			AND C.[codigo] = @IN_codigoCarrera
			AND S.[codigo] = @IN_codigoSede
            ORDER BY S.[nombre], C.[nombre], A.[nombre] ASC
            FOR JSON PATH),
		'[]'    -- Por defecto, si no hay resultados, no retorna nada, entonces esto hace
                -- que el JSON retornado sea un arreglo vac�o
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