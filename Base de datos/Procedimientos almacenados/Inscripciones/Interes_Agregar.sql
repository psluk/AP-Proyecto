--------------------------------------------------------------------------
-- Autor:       Paúl Rodríguez García
-- Fecha:       2023-09-01
-- Descripción: Agrega un evento de interés.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Interes_Agregar]
    -- Parámetros
    @IN_evento      VARCHAR(36),
    @IN_carnet      INT
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
    DECLARE @uuidEvento UNIQUEIDENTIFIER = NULL;
    DECLARE @idEvento INT = NULL;
    DECLARE @idEstudiante INT = NULL;

    BEGIN TRY

        -- VALIDACIONES
        SET @uuidEvento = TRY_CAST(@IN_evento AS UNIQUEIDENTIFIER);

        IF @uuidEvento IS NULL
        BEGIN
            RAISERROR('El identificador "%s" no es válido', 16, 1, @IN_evento);
        END;

        SELECT  @idEvento = E.[id]
        FROM    [dbo].[Eventos] E
        WHERE   E.[uuid] = @IN_evento
            AND E.[eliminado] = 0;

        IF @idEvento IS NULL
        BEGIN
            RAISERROR('No existe ningún evento con el identificador "%s"', 16, 1, @IN_evento);
        END;

        SELECT  @idEstudiante = E.[id]
        FROM    [dbo].[Estudiantes] E
        WHERE   E.[carnet] = @IN_carnet
            AND E.[eliminado] = 0;

        IF @idEstudiante IS NULL
        BEGIN
            RAISERROR('No existe ningún estudiante con el carné %d', 16, 1, @IN_carnet);
        END;

        IF EXISTS ( SELECT  1
                    FROM    [dbo].[EventosDeInteres] EdI
                    WHERE   EdI.[idEvento] = @idEvento
                        AND EdI.[idEstudiante] = @idEstudiante
                        AND EdI.[eliminado] = 0 )
        BEGIN
            RAISERROR('El evento ya está marcado como evento de interés', 16, 1);
        END;

        IF (SELECT  E.[fechaFin]
            FROM    [dbo].[Eventos] E
            WHERE   E.[id] = @idEvento
                AND E.[eliminado] = 0 ) < GETUTCDATE()
        BEGIN
            RAISERROR('No es posible marcar un evento pasado como evento de interés', 16, 1);
        END;

        -- INICIO DE LA TRANSACCIÓN
        IF @@TRANCOUNT = 0
        BEGIN
            SET @transaccionIniciada = 1;
            BEGIN TRANSACTION;
        END;

            INSERT INTO [dbo].[EventosDeInteres]
            (
                [idEstudiante],
                [idEvento],
                [eliminado]
            )
            VALUES
            (
                @idEstudiante,
                @idEvento,
                0
            );

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