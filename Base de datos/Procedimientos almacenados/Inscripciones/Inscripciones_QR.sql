--------------------------------------------------------------------------
-- Autor:       Paúl Rodríguez García
-- Fecha:       2023-09-01
-- Descripción: Devuelve los detalles mínimos de la inscripción a un
--              evento, para generar un código QR.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Inscripciones_QR]
    -- Parámetros
    @IN_evento      UNIQUEIDENTIFIER,
    @IN_carnet      INT
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
    DECLARE @idEvento INT = NULL;
    DECLARE @idEstudiante INT = NULL;

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

        IF NOT EXISTS ( SELECT  1
                        FROM    [dbo].[Inscripciones] I
                        WHERE   I.[idEvento] = @idEvento
                            AND I.[idEstudiante] = @idEstudiante
                            AND I.[eliminado] = 0 )
        BEGIN
            RAISERROR('El estudiante no tiene ninguna inscripción para este evento', 16, 1);
        END;

        IF (SELECT  I.[asistencia]
            FROM    [dbo].[Inscripciones] I
            WHERE   I.[idEvento] = @idEvento
                AND I.[idEstudiante] = @idEstudiante
                AND I.[eliminado] = 0 ) = 0
        BEGIN
            RAISERROR('La asistencia del estudiante para este evento no está confirmada', 16, 1);
        END;

        -- Se retorna la información
        SELECT (
            SELECT  Ev.[uuid]       AS  'evento.id',
                    Es.[carnet]     AS  'estudiante.carnet',
                    I.[timestamp]   AS  'inscripcion.fecha'
            FROM    [dbo].[Inscripciones] I
            INNER JOIN  [dbo].[Estudiantes] Es
                ON  I.[idEstudiante] = Es.[id]
            INNER JOIN  [dbo].[Eventos] Ev
                ON  I.[idEvento] = Ev.[id]
            WHERE   I.[idEvento] = @idEvento
                AND I.[idEstudiante] = @idEstudiante
                AND I.[eliminado] = 0
            FOR JSON PATH
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