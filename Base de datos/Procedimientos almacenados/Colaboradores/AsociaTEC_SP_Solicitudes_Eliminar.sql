--------------------------------------------------------------------------
-- Autor:       Luis Fernando Molina
-- Fecha:       2023-09-03
-- Descripci�n: elimina una solicitud de un estudiante para ser colaborador
--               de evento, solo las pendientes.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Solicitudes_Eliminar]
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

		--revisamos que exista la solicitud a borrar y que aun este pendiente

		IF NOT EXISTS (SELECT 1
		FROM [dbo].[Solicitudes] S
		INNER JOIN [dbo].[Estudiantes] E
			ON E.[id] = S.[idEstudiante]
		INNER JOIN [dbo].[Eventos] Eve
			ON Eve.[id] = S.[idEvento]
        AND E.[eliminado] = 0
		AND Eve.[eliminado] = 0
        AND S.[eliminado] = 0
        AND S.[aceptado] IS NULL
		AND E.[carnet] = @IN_carnet
		AND Eve.[uuid] = @IN_identificadorEvento)
		BEGIN 
            --La solicitud ya existe y ya se colaborador
			RAISERROR('El estudiante "%s" no tiene ninguna solicitud pendiente para borrar', 16, 1, @IN_carnet);
        END;


		-- INICIO DE LA TRANSACCI�N
		IF @@TRANCOUNT = 0
		BEGIN
		    SET @transaccionIniciada = 1;
		    BEGIN TRANSACTION;
		END;

            UPDATE S
            SET S.[eliminado] = 1 
            FROM [dbo].[Solicitudes] S
            INNER JOIN [dbo].[Estudiantes] E
		    	ON E.[id] = S.[idEstudiante]
		    INNER JOIN [dbo].[Eventos] Eve
		    	ON Eve.[id] = S.[idEvento]
            AND E.[eliminado] = 0
		    AND Eve.[eliminado] = 0
            AND S.[eliminado] = 0
            AND S.[aceptado] IS NULL
		    AND E.[carnet] = @IN_carnet
		    AND Eve.[uuid] = @IN_identificadorEvento
			
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