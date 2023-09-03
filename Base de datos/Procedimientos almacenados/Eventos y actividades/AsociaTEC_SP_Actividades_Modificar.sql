--------------------------------------------------------------------------
-- Autor:       Fabián Vargas
-- Fecha:       23-09-03
-- Descripción: Modifica una actividad
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Actividades_Modificar]
    @IN_uuid UNIQUEIDENTIFIER,
    @IN_nombre VARCHAR(64),
    @IN_Lugar VARCHAR(128),
    @IN_fechaInicio DATETIME,
    @IN_fechaFin DATETIME

AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
    


    BEGIN TRY

        -- VALIDACIONES
        IF NOT EXISTS(
        SELECT 1
        FROM [dbo].[Actividades] A
        WHERE A.[uuid] = @IN_uuid
        AND A.[eliminado] = 0
        )
        BEGIN
            RAISERROR('No existe la actividad deseada a modificar', 50000, 1)
        END

        IF LTRIM(RTRIM(@IN_Lugar)) = ''
        BEGIN
            RAISERROR('No se proporcionó un lugar', 16, 1);
        END;

        IF LTRIM(RTRIM(@IN_nombre)) = ''
        BEGIN
            RAISERROR('No se proporcionó un nombre', 16, 1);
        END;

        -- INICIO DE LA TRANSACCIÓN
        IF @@TRANCOUNT = 0
        BEGIN
            SET @transaccionIniciada = 1;
            BEGIN TRANSACTION;
        END;

        UPDATE A
        SET A.[nombre] = @IN_nombre,
            A.[lugar] = @IN_Lugar,
            A.[fechaInicio] = @IN_FechaInicio,
            A.[fechaFin] = @IN_FechaFin
        FROM [dbo].[Actividades] A
        WHERE A.[uuid] = @IN_uuid
        AND A.[eliminado] = 0

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