--------------------------------------------------------------------------
-- Autor:       Luis Fernando Molina
-- Fecha:       2023-09-02
-- Descripci�n: Elimina a un unico colaborador de evento.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Colaboradores_Eliminar]
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


    BEGIN TRY

		--REALIZAR LAS VALIDACIONES

        -- VALIDACIONES

		IF NOT EXISTS ( SELECT  1
                    FROM [dbo].[Estudiantes] E
                    WHERE E.carnet = @IN_carnet
					AND E.[eliminado] = 0)
        BEGIN
            RAISERROR('El carnet "%s" no existe.', 16, 1, @IN_carnet)
        END;
    
		IF (LTRIM(RTRIM(@IN_identificadorEvento)) = '')
        BEGIN
            -- identificadorEvento vacio
            RAISERROR('Parametro [identificadorEvento] es vacio.', 16, 1)
        END;

		IF NOT EXISTS ( SELECT  1
                    FROM [dbo].[Eventos] E
                    WHERE E.[uuid] = @IN_identificadorEvento
					AND E.[eliminado] = 0)
        BEGIN
            RAISERROR('El evento no existe.', 16, 1)
        END;

		IF NOT EXISTS (SELECT 1
			FROM [dbo].[ColaboradoresDeEvento] CdE
			INNER JOIN [dbo].[Estudiantes] E
				ON E.[id] = Cde.[idEstudiante]
			INNER JOIN [dbo].[Eventos] Eve
				ON Eve.[id] = CdE.[idEventos]
			WHERE CdE.[eliminado] = 0
			AND E.[eliminado] = 0
			AND Eve.[eliminado] = 0
			AND E.[carnet] = @IN_carnet
			AND Eve.[uuid] = @IN_identificadorEvento)
		BEGIN
            -- colaborador no existe
            RAISERROR('El colaborador que se desea eliminar no existe o ya fue eliminado.', 16, 1)
        END;

		-- INICIO DE LA TRANSACCI�N
        IF @@TRANCOUNT = 0
        BEGIN
            SET @transaccionIniciada = 1;
            BEGIN TRANSACTION;
        END;

            UPDATE CdE
			SET CdE.[eliminado] = 1
			FROM [dbo].[ColaboradoresDeEvento] CdE
			INNER JOIN [dbo].[Estudiantes] E
				ON E.[id] = Cde.[idEstudiante]
			INNER JOIN [dbo].[Eventos] Eve
				ON Eve.[id] = CdE.[idEventos]
			WHERE CdE.[eliminado] = 0
			AND E.[eliminado] = 0
			AND Eve.[eliminado] = 0
			AND E.[carnet] = @IN_carnet
			AND Eve.[uuid] = @IN_identificadorEvento;

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