--------------------------------------------------------------------------
-- Autor:       Luis Fernando Molina
-- Fecha:       2023-09-02
-- Descripción: Retorna la lista de los estudiantes con solicitudes según los criterios
--              de búsqueda.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Solicitudes_Lista]
    -- Parámetros
    @IN_identificadorEvento UNIQUEIDENTIFIER,
	@IN_filtro VARCHAR(16) = NULL
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
	DECLARE @usartipoasociacion VARCHAR(16) = 'Asocia%';
    DECLARE @usarPendientes VARCHAR(16) = 'pendie%';
    DECLARE @usarAceptados VARCHAR(16) = 'acept%';
    DECLARE @usarRechazados VARCHAR(16) = 'rechaz%';
    DECLARE @usarfiltro INT = 0;

    BEGIN TRY

        -- VALIDACIONES
    
		IF (LTRIM(RTRIM(@IN_identificadorEvento)) = '')
        BEGIN
            -- identificadorEvento vacio
            RAISERROR('Parametro [identificadorEvento] es vacio.', 16, 1)
        END;

        
        IF(@IN_filtro IS NOT NULL)
        BEGIN
            IF(@IN_filtro LIKE @usarPendientes)
            BEGIN
                SET @usarfiltro = 1;
            END;

            IF(@IN_filtro LIKE @usarAceptados)
            BEGIN
                SET @usarfiltro = 2;
            END;

            IF(@IN_filtro LIKE @usarRechazados)
            BEGIN
                SET @usarfiltro = 3;
            END;
        END;


		SELECT COALESCE(
            (SELECT E.[carnet]      AS 'carnet',
                    E.[apellido1]   AS 'apellido1',
                    E.[apellido2]   AS 'apellido2',
					E.[nombre]      AS 'nombre',
                    S.[aceptado] AS 'aceptado'
			FROM [dbo].[Solicitudes] S
			INNER JOIN [dbo].[Estudiantes] E
				ON E.[id] = S.[idEstudiante]
			INNER JOIN [dbo].[Eventos] Eve
				ON Eve.[id] = S.[idEvento]
			INNER JOIN [dbo].[Asociaciones] A
			    ON  A.[id] = Eve.[idAsociacion]
			INNER JOIN [dbo].[Usuarios] U
				ON U.[id] = A.[idUsuario]
			INNER JOIN [dbo].[TiposUsuario] Tpu
				ON Tpu.[id] = U.[idTipoUsuario]
			WHERE S.[eliminado] = 0 --no eliminados (solicitudes)
			AND (@usarfiltro = 0 
                OR (@usarfiltro = 1 
                    AND S.[aceptado] IS NULL) 
                OR (@usarfiltro = 2 
                    AND S.[aceptado] = 1) 
                OR (@usarfiltro = 3 
                    AND S.[aceptado] = 0))
            AND Eve.[uuid] = @IN_identificadorEvento -- uuid evento
			AND E.[eliminado] = 0 --no eliminados (estudiantes)
			AND Eve.[eliminado] = 0 --no eliminados (eventos)
			AND A.[eliminado] = 0 --no eliminados (asociaciones)
			AND Tpu.[nombre] LIKE @usartipoasociacion --que sea tipo asociacion
			AND U.[eliminado] = 0 --no eliminados (usuario)
            ORDER BY E.[apellido1], E.[apellido2], E.[nombre] ASC
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