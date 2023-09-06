--------------------------------------------------------------------------
-- Autor:       Paúl Rodríguez García
-- Fecha:       2023-09-05
-- Descripción: Actualiza el estado de una propuesta.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Propuestas_Detalles]
    -- Parámetros
    @IN_propuesta       UNIQUEIDENTIFIER,
    @IN_estado          VARCHAR(32)
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
    DECLARE @idPropuesta INT = NULL;
    DECLARE @idEstado INT = NULL;

    BEGIN TRY

        -- VALIDACIONES
        SELECT  @idPropuesta = P.[id]
        FROM    [dbo].[Propuestas] P
        WHERE   P.[uuid] = @IN_propuesta
            AND P.[eliminado] = 0;

        IF @idPropuesta IS NULL
        BEGIN
            DECLARE @uuid_varchar VARCHAR(36) = (SELECT CONVERT(NVARCHAR(36), @IN_propuesta));
            RAISERROR('No existe ninguna propuesta con el identificador "%s"', 16, 1, @uuid_varchar);
        END;

        SELECT  @idEstado = EdP.[id]
        FROM    [dbo].[EstadosDePropuesta] EdP
        WHERE   EdP.[descripcion] = @IN_estado;

        IF @idEstado IS NULL
        BEGIN
            RAISERROR('No existe el estado "%s"', 16, 1, @IN_estado);
        END;

        -- INICIO DE LA TRANSACCIÓN
        IF @@TRANCOUNT = 0
        BEGIN
            SET @transaccionIniciada = 1;
            BEGIN TRANSACTION;
        END;

            UPDATE  P
            SET     P.[idEstado] = @idEstado
            FROM    [dbo].[Propuestas] P
            WHERE   P.[id] = @idPropuesta;

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