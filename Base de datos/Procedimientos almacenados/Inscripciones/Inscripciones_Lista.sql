--------------------------------------------------------------------------
-- Autor:       Paúl Rodríguez García
-- Fecha:       2023-09-01
-- Descripción: Devuelve la lista de inscripciones a un evento o de un
--              estudiante en específico.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Inscripciones_Lista]
    -- Parámetros
    @IN_evento      UNIQUEIDENTIFIER = NULL,
    @IN_carnet      INT = NULL
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
    DECLARE @idEvento INT = NULL;
    DECLARE @idEstudiante INT = NULL;
    DECLARE @usarFiltroDeEvento BIT = 0;
    DECLARE @usarFiltroDeEstudiante BIT = 0;

    BEGIN TRY

        -- VALIDACIONES
        IF @IN_evento IS NOT NULL
        BEGIN
            SET @usarFiltroDeEvento = 1;

            SELECT  @idEvento = E.[id]
            FROM    [dbo].[Eventos] E
            WHERE   E.[uuid] = @IN_evento
                AND E.[eliminado] = 0;

            IF @idEvento IS NULL
            BEGIN
                DECLARE @uuid_varchar VARCHAR(36) = (SELECT CONVERT(NVARCHAR(36), @IN_evento));
                RAISERROR('No existe ningún evento con el identificador "%s"', 16, 1, @uuid_varchar);
            END;
        END;

        IF @IN_carnet IS NOT NULL
        BEGIN
            SET @usarFiltroDeEstudiante = 1;

            SELECT  @idEstudiante = E.[id]
            FROM    [dbo].[Estudiantes] E
            WHERE   E.[carnet] = @IN_carnet
                AND E.[eliminado] = 0;

            IF @idEstudiante IS NULL
            BEGIN
                RAISERROR('No existe ningún estudiante con el carné %d', 16, 1, @IN_carnet);
            END;
        END;

        -- Se retorna la información
        SELECT COALESCE((
            SELECT  Ev.[uuid]           AS  'evento.id',
                    Ev.[titulo]         AS  'evento.nombre',
                    Ev.[fechaInicio]    AS  'evento.inicio',
                    Ev.[fechaFin]       AS  'evento.fin',
                    Es.[carnet]         AS  'estudiante.carnet',
                    Es.[nombre]         AS  'estudiante.nombre',
                    Es.[apellido1]      AS  'estudiante.apellido1',
                    Es.[apellido2]      AS  'estudiante.apellido2',
                    CAST (CASE
                    WHEN I.[id] IS NULL
                    THEN 0
                    ELSE 1 END AS BIT)  AS  'inscripcion.inscrito',
                    I.[timestamp]       AS  'inscripcion.fecha',
                    I.[asistencia]      AS  'inscripcion.confirmada',
                    CAST (CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM [dbo].[Encuestas] En
                        WHERE En.[idInscripcion] = I.[id]
                            AND En.[eliminado] = 0
                    ) OR (I.[id] IS NULL)
                    THEN 0
                    ELSE 1 END AS BIT)  AS 'inscripcion.encuestaActiva'
            FROM    [dbo].[Inscripciones] I
            FULL OUTER JOIN  [dbo].[EventosDeInteres] EdI
                ON  I.[idEvento] = EdI.[idEvento]
                AND  I.[idEstudiante] = EdI.[idEstudiante]
            INNER JOIN  [dbo].[Estudiantes] Es
                ON  I.[idEstudiante] = Es.[id]
                OR  Edi.[idEstudiante] = Es.[id]
            INNER JOIN  [dbo].[Eventos] Ev
                ON  I.[idEvento] = Ev.[id]
                OR  EdI.[idEvento] = Ev.[id]
            WHERE   (
                        @usarFiltroDeEvento = 0
                    OR  Ev.[id] = @idEvento
                ) AND (
                        @usarFiltroDeEstudiante = 0
                    OR  Es.[id] = @idEstudiante
                ) AND (
                    I.[eliminado] = 0
                    OR I.[eliminado] IS NULL
                ) AND (
                    EdI.[eliminado] = 0
                    OR EdI.[eliminado] IS NULL
                )
            FOR JSON PATH),
            '[]'    -- Por defecto, si no hay resultados, no retorna nada, entonces esto hace
                    -- que el JSON retornado sea un arreglo vacío
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