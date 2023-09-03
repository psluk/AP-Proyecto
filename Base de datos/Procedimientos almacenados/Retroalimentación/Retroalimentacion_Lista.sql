--------------------------------------------------------------------------
-- Autor:       Paúl Rodríguez García
-- Fecha:       2023-09-02
-- Descripción: Devuelve la lista de encuestas de un evento o de un
--              estudiante en específico.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Retroalimentacion_Lista]
    -- Parámetros
    @IN_evento      VARCHAR(36) = NULL,
    @IN_carnet      INT = NULL
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
    DECLARE @usarFiltroDeEvento BIT = 0;
    DECLARE @usarFiltroDeEstudiante BIT = 0;

    BEGIN TRY

        -- VALIDACIONES
        IF @IN_evento IS NOT NULL
        BEGIN
            SET @usarFiltroDeEvento = 1;
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
        SELECT COALESCE(
            (SELECT Ev.[uuid]           AS  'evento.id',
                    Ev.[titulo]         AS  'evento.nombre',
                    Ev.[fechaInicio]    AS  'evento.inicio',
                    Es.[carnet]         AS  'estudiante.carnet',
                    Es.[nombre]         AS  'estudiante.nombre',
                    Es.[apellido1]      AS  'estudiante.apellido1',
                    Es.[apellido2]      AS  'estudiante.apellido2',
                    Ec.[calificacion]   AS  'encuesta.calificacion',
                    CASE 
                        WHEN LEN(Ec.[comentario]) <= 50 THEN Ec.[comentario]
                        ELSE LEFT(Ec.[comentario], 47) + '…'
                    END                 AS  'encuesta.comentario'
            FROM    [dbo].[Encuestas] Ec
            INNER JOIN [dbo].[Inscripciones] I
                ON  Ec.[idInscripcion] = I.[id]
            INNER JOIN  [dbo].[Estudiantes] Es
                ON  I.[idEstudiante] = Es.[id]
            INNER JOIN  [dbo].[Eventos] Ev
                ON  I.[idEvento] = Ev.[id]
            WHERE   (
                        @usarFiltroDeEvento = 0
                    OR  I.[idEvento] = @idEvento
                ) AND (
                        @usarFiltroDeEstudiante = 0
                    OR  I.[idEstudiante] = @idEstudiante
                ) AND Ec.[eliminado] = 0
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