--------------------------------------------------------------------------
-- Autor:       Luis Fernando Molina
-- Fecha:       2023-09-03
-- Descripci�n: Retorna los detalles de una asociacion
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Asociaciones_Detalles]
    -- Par�metros
	@IN_correo VARCHAR(128) = NULL,
    @IN_codigoSede VARCHAR(4) = NULL,
    @IN_codigoCarrera VARCHAR(4) = NULL
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACI�N DE VARIABLES
	DECLARE @usarTipoAsociacion VARCHAR(16) = 'Asocia%';
    DECLARE @idAsociacion INT = NULL;

    BEGIN TRY

        -- VALIDACIONES

        IF @IN_correo IS NOT NULL AND @IN_codigoSede IS NOT NULL AND @IN_codigoCarrera IS NOT NULL
        BEGIN
            RAISERROR('Solo puede usar un criterio de búsqueda a la vez', 16, 1);
        END;

        IF (@IN_codigoSede IS NULL AND @IN_codigoCarrera IS NOT NULL) OR (@IN_codigoSede IS NOT NULL AND @IN_codigoCarrera IS NULL)
        BEGIN
            RAISERROR('Debe proporcionar el código de sede y de carrera, o hacer la búsqueda solo por correo electrónico', 16, 1);
        END;

        IF @IN_correo IS NOT NULL
        BEGIN
            SELECT @idAsociacion = A.[id]
            FROM [dbo].[Usuarios] U 
                    INNER JOIN [dbo].[TiposUsuario] Tu 
                    ON Tu.[id] = U.[idTipoUsuario]
                    INNER JOIN [dbo].[Asociaciones] A
                    ON A.[idUsuario] = U.[id]
                    WHERE U.[correo] = LTRIM(RTRIM(@IN_correo))
                    AND Tu.[nombre] LIKE @usarTipoAsociacion 
                    AND U.[eliminado] = 0
                    AND A.[eliminado] = 0;
        END
        ELSE
        BEGIN
            SELECT @idAsociacion = A.[id]
            FROM [dbo].[Asociaciones] A
            INNER JOIN [dbo].[Carreras] C
                ON C.[id] = A.[idCarrera]
            INNER JOIN [dbo].[Sedes] S
                ON S.[id] = C.[idSede]
            WHERE S.[codigo] = LTRIM(RTRIM(@IN_codigoSede))
                AND C.[codigo] = LTRIM(RTRIM(@IN_codigoCarrera))
                AND A.[eliminado] = 0;
        END;

        IF @idAsociacion IS NULL
        BEGIN
            RAISERROR('No se encontró la asociación', 16, 1);
        END;		

		SELECT COALESCE(
            (SELECT	A.[nombre]  AS 'asociacion.nombre',
				U.[correo]		AS 'asociacion.correo',
				A.[telefono]	AS 'asociacion.telefono',
				A.[descripcion]	AS 'asociacion.descripcion',
			    C.[nombre]      AS 'carrera.nombre',
				C.[codigo]      AS 'carrera.codigo',
			    S.[nombre]      AS 'sede.nombre',
				S.[codigo]      AS 'sede.codigo'
			FROM [dbo].[Asociaciones] A
			INNER JOIN [dbo].[Carreras] C
				ON C.[id] = A.[idCarrera]
			INNER JOIN [dbo].[Sedes] S
				ON S.[id] = C.[idSede]
			INNER JOIN [dbo].[Usuarios] U
				ON U.[id] = A.[idUsuario]
			WHERE A.[id] = @idAsociacion
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