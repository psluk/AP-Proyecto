--------------------------------------------------------------------------
-- Autor:       Paúl Rodríguez García
-- Fecha:       2023-09-01
-- Descripción: Agrega una respuesta a un formulario de retroalimentación
--              de un evento.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Retroalimentacion_Agregar]
    -- Parámetros
    @IN_evento          UNIQUEIDENTIFIER,
    @IN_carnet          INT,
    @IN_calificacion    TINYINT,
    @IN_comentario      VARCHAR(256)
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
    DECLARE @idEvento INT = NULL;
    DECLARE @idEstudiante INT = NULL;
    DECLARE @idInscripcion INT = NULL;

    BEGIN TRY

        -- VALIDACIONES
        SELECT  @idEvento = E.[id]
        FROM    [dbo].[Eventos] E
        WHERE   E.[uuid] = @IN_evento
            AND E.[eliminado] = 0;

        IF @idEvento IS NULL
        BEGIN
            DECLARE @uuid_varchar VARCHAR(36) = (SELECT CONVERT(NVARCHAR(36), @IN_evento));
            RAISERROR('No existe ningún evento con el identificador "%s"', 16, 1, @uuid_varchar);
        END;

        SELECT  @idEstudiante = E.[id]
        FROM    [dbo].[Estudiantes] E
        WHERE   E.[carnet] = @IN_carnet
            AND E.[eliminado] = 0;

        IF @idEstudiante IS NULL
        BEGIN
            RAISERROR('No existe ningún estudiante con el carné %d', 16, 1, @IN_carnet);
        END;

        SELECT  @idInscripcion = I.[id]
        FROM    [dbo].[Inscripciones] I
        WHERE   I.[idEvento] = @idEvento
            AND I.[idEstudiante] = @idEstudiante
            AND I.[eliminado] = 0;

        IF @idInscripcion IS NULL
        BEGIN
            RAISERROR('El estudiante no tiene ninguna inscripción para este evento', 16, 1);
        END;

        IF (SELECT  E.[fechaFin]
            FROM    [dbo].[Eventos] E
            WHERE   E.[id] = @idEvento
                AND E.[eliminado] = 0 ) > GETUTCDATE()
        BEGIN
            RAISERROR('No es posible enviar la retroalimentación antes de la finalización del evento', 16, 1);
        END;

        IF (SELECT  I.[asistencia]
            FROM    [dbo].[Inscripciones] I
            WHERE   I.[idEvento] = @idEvento
                AND I.[idEstudiante] = @idEstudiante
                AND I.[eliminado] = 0 ) = 0
        BEGIN
            RAISERROR('La asistencia del estudiante para este evento no se confirmó', 16, 1);
        END;

        IF (@IN_calificacion < 1) OR (@IN_calificacion > 5)
        BEGIN
            RAISERROR('La calificación %d no es válida', 16, 1, @IN_calificacion);
        END;

        IF EXISTS ( SELECT  1
                    FROM    [dbo].[Encuestas] E
                    WHERE   E.[idInscripcion] = @idInscripcion
                        AND E.[eliminado] = 0 )
        BEGIN
            RAISERROR('Ya se envió la retroalimentación de este evento', 16, 1);
        END;

        -- INICIO DE LA TRANSACCIÓN
        IF @@TRANCOUNT = 0
        BEGIN
            SET @transaccionIniciada = 1;
            BEGIN TRANSACTION;
        END;

            INSERT INTO [dbo].[Encuestas]
            (
                [idInscripcion],
                [calificacion],
                [comentario],
                [timestamp],
                [eliminado]
            )
            VALUES
            (
                @idInscripcion,
                @IN_calificacion,
                @IN_comentario,
                GETUTCDATE(),
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