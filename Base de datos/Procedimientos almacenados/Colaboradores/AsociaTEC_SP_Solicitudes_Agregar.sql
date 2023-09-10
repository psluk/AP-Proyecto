--------------------------------------------------------------------------
-- Autor:       Luis Fernando Molina
-- Fecha:       2023-09-03
-- Descripci�n: agrega a una solicitud de un estudiante para ser colaborador
--               de evento.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Solicitudes_Agregar]
    -- Par�metros
	@IN_carnet INT,
    @IN_identificadorEvento UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACI�N DE VARIABLES
	DECLARE @usarActivaPrevia BIT = 0;
    DECLARE @usarPendientePrevia BIT = 0;
	DECLARE @usarIDEvento INT = NULL;
	DECLARE @usarIDEstudiante INT = NULL;

    BEGIN TRY

        -- VALIDACIONES
		SELECT  @usarIDEstudiante = E.[id]
        FROM [dbo].[Estudiantes] E
        WHERE E.carnet = @IN_carnet
		AND E.[eliminado] = 0;
		
		IF (@usarIDEstudiante IS NULL)
        BEGIN
            RAISERROR('El carnet "%s" no existe.', 16, 1, @IN_carnet)
        END;
    
		IF (LTRIM(RTRIM(@IN_identificadorEvento)) = '')
        BEGIN
            -- identificadorEvento vacio
            RAISERROR('Parametro [identificadorEvento] es vacio.', 16, 1)
        END;

		SELECT  @usarIDEvento = E.[id]
        FROM [dbo].[Eventos] E
        WHERE E.[uuid] = @IN_identificadorEvento
		AND E.[eliminado] = 0;
		
		IF(@usarIDEvento IS NULL)

        BEGIN
            RAISERROR('El evento no existe.', 16, 1)
        END;

		--revisamos que si ya hay una solicitud activa y que ya sea colaborador

		IF EXISTS (SELECT 1
		FROM [dbo].[Solicitudes] S
		INNER JOIN [dbo].[Estudiantes] E
			ON E.[id] = S.[idEstudiante]
		INNER JOIN [dbo].[Eventos] Eve
			ON Eve.[id] = S.[idEvento]
        INNER JOIN [dbo].[ColaboradoresDeEvento] CdE
			ON CdE.[idEventos] = Eve.[id]
		WHERE CdE.[eliminado] = 0
        AND E.[eliminado] = 0
		AND Eve.[eliminado] = 0
        AND S.[eliminado] = 0
        AND S.[aceptado] IS NOT NULL
		AND E.[carnet] = @IN_carnet
		AND Eve.[uuid] = @IN_identificadorEvento)
		BEGIN 
            --La solicitud ya existe y ya se colaborador
			RAISERROR('El estudiante "%s" ya es colaborador', 16, 1, @IN_carnet);
        END;

        --revisamos si ya hay una solicitud pendiente
		IF EXISTS (SELECT 1
		FROM [dbo].[Solicitudes] S
		INNER JOIN [dbo].[Estudiantes] E
			ON E.[id] = S.[idEstudiante]
		INNER JOIN [dbo].[Eventos] Eve
			ON Eve.[id] = S.[idEvento]
		WHERE E.[eliminado] = 0
		AND Eve.[eliminado] = 0
        AND S.[eliminado] = 0
        AND S.[aceptado] IS NULL
		AND E.[carnet] = @IN_carnet
		AND Eve.[uuid] = @IN_identificadorEvento)
		BEGIN 
            --La solicitud ya existe
			RAISERROR('El estudiante "%s" ya tiene una solicitud pendiente', 16, 1, @IN_carnet);
        END;

		-- INICIO DE LA TRANSACCI�N
		IF @@TRANCOUNT = 0
		BEGIN
		    SET @transaccionIniciada = 1;
		    BEGIN TRANSACTION;
		END;
		    INSERT INTO [dbo].[Solicitudes] (
				[idEvento], 
				[idEstudiante], 
				[fecha], 
				[eliminado],
                [aceptado]
			)
			VALUES(@usarIDEvento,
				   @usarIDEstudiante,
				   GETDATE(),
				   0,
                   NULL);
			
		-- COMMIT DE LA TRANSACCI�N
		IF @transaccionIniciada = 1
		BEGIN
		    COMMIT TRANSACTION;
		END;

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