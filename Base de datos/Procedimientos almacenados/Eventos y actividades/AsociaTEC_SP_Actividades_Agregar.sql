--------------------------------------------------------------------------
-- Autor:       Fabián Vargas
-- Fecha:       23-09-03
-- Descripción: Agrega una actividad de un evento
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Actividades_Agregar]
    @IN_uuid UNIQUEIDENTIFIER,
    @IN_lugar VARCHAR(128),
    @IN_fechaInicio DATETIME,
    @IN_FechaFin DATETIME
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
    DECLARE @ID_Evento INT = NULL
    BEGIN TRY

        -- VALIDACIONES
        SELECT @ID_Evento = E.[id]
        FROM [dbo].[Eventos] E
        WHERE E.[uuid] = @IN_uuid
        AND E.[eliminado] = 0

        IF @ID_Evento IS NULL
        BEGIN
            RAISERROR('No existe el evento al cual se quiere agregar la actividad',50000, 1)
        END

        -- INICIO DE LA TRANSACCIÓN
        IF @@TRANCOUNT = 0
        BEGIN
            SET @transaccionIniciada = 1;
            BEGIN TRANSACTION;
        END;

        INSERT INTO [dbo].[Actividades]
        (
            idEvento,
            uuid,
            lugar,
            fechaInicio,
            fechaFin,
            eliminado
        )
        VALUES
        (
            @ID_Evento,
            NEWID(),
            @IN_lugar,
            @IN_fechaInicio,
            @IN_FechaFin,
            0
        )

        -- COMMIT DE LA TRANSACCIÓN
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