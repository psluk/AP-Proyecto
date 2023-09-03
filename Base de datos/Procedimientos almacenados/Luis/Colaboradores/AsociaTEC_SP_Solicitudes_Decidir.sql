

--------------------------------------------------------------------------
-- Autor:       Luis Fernando Molina
-- Fecha:       2023-09-03
-- Descripción: accepta o niega la solicitud del estudiante y lo agrega como
-- un colaborador de evento si fuera necesario.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Solicitudes_Decidir]
    -- Parámetros
	@IN_acceptado BIT,
	@IN_carnet INT,
    @IN_identificadorEvento UNIQUEIDENTIFIER,
	@IN_descripcion VARCHAR(64) = NULL
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
	DECLARE @usarIDEvento INT = NULL;
	DECLARE @usarIDEstudiante INT = NULL;
	DECLARE @usarIDSolicitud INT = NULL;
	DECLARE @usarIDColaborador INT = NULL;

    BEGIN TRY

		--REALIZAR LAS VALIDACIONES

        -- VALIDACIONES
		--encontramos el id del estudiante
		SELECT  @usarIDEstudiante = E.[id]
        FROM [dbo].[Estudiantes] E
        WHERE E.carnet = @IN_carnet
		AND E.[eliminado] = 0
		IF (@usarIDEstudiante IS NULL)
        BEGIN
            RAISERROR('El carnet "%s" no existe.', 16, 1, @IN_carnet)
        END;
    
		IF (LTRIM(RTRIM(@IN_identificadorEvento)) = '')
        BEGIN
            -- identificadorEvento vacio
            RAISERROR('Parametro [identificadorEvento] es vacio.', 16, 1)
        END;
		-- encontramos el id del evento
		SELECT  @usarIDEvento = E.[id]
        FROM [dbo].[Eventos] E
        WHERE E.[uuid] = @IN_identificadorEvento
		AND E.[eliminado] = 0
		IF(@usarIDEvento IS NULL)
        BEGIN
            RAISERROR('El evento no existe.', 16, 1)
        END;

		--revisamos si se recibio una descripcion y si no la dejamos vacio
		IF(@IN_descripcion IS NULL)
		BEGIN
			SET @IN_descripcion = '';
		END;

		--buscamos el id de la solicitud

		SELECT @usarIDSolicitud = S.[id]
		FROM [dbo].[Solicitudes] S
		INNER JOIN [dbo].[Estudiantes] E
			ON E.[id] = S.[idEstudiante]
		INNER JOIN [dbo].[Eventos] Eve
			ON Eve.[id] = S.[idEvento]
		WHERE E.[id] = @usarIDEstudiante
		AND Eve.[id] = @usarIDEvento
		IF(@usarIDSolicitud IS NULL)
		BEGIN 
            --La solicitud no existe
			RAISERROR('La solicitud no existe.', 16, 1);
        END;

		IF(@IN_acceptado = 0) -- solicitud rechazada
		BEGIN

			-- INICIO DE LA TRANSACCIÓN
			IF @@TRANCOUNT = 0
			BEGIN
			    SET @transaccionIniciada = 1;
			    BEGIN TRANSACTION;
			END;

			    UPDATE S
				SET S.[eliminado] = 1
				FROM [dbo].[Solicitudes] S
				WHERE S.[id] = @usarIDSolicitud

			-- COMMIT DE LA TRANSACCIÓN
			IF @transaccionIniciada = 1
			BEGIN
			    COMMIT TRANSACTION;
			END;

		END;
		ELSE BEGIN -- acceptamos la solicitud

			-- INICIO DE LA TRANSACCIÓN
			IF @@TRANCOUNT = 0
			BEGIN
			    SET @transaccionIniciada = 1;
			    BEGIN TRANSACTION;
			END;

			    UPDATE S
				SET S.[aceptado] = 1
				FROM [dbo].[Solicitudes] S
				WHERE S.[id] = @usarIDSolicitud;

				EXEC [dbo].[AsociaTEC_SP_Colaboradores_Agregar] @IN_carnet, @IN_descripcion, @IN_identificadorEvento;

			-- COMMIT DE LA TRANSACCIÓN
			IF @transaccionIniciada = 1
			BEGIN
			    COMMIT TRANSACTION;
			END;

		END;

		SELECT 1

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