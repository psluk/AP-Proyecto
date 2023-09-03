--------------------------------------------------------------------------
-- Autor:       Paúl Rodríguez García
-- Fecha:       2023-09-01
-- Descripción: Devuelve los detalles de la inscripción a un evento.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Inscripciones_Detalles]
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
        WHERE   E.[uuid] = @uuidEvento
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

        IF NOT EXISTS ( SELECT  1
                        FROM    [dbo].[Inscripciones] I
                        WHERE   I.[idEvento] = @idEvento
                            AND I.[idEstudiante] = @idEstudiante
                            AND I.[eliminado] = 0 )
        BEGIN
            RAISERROR('El estudiante no tiene ninguna inscripción para este evento', 16, 1);
        END;

        -- Se retorna la información
        SELECT (
            SELECT  Ev.[uuid]           AS  'evento.id',
                    Ev.[titulo]         AS  'evento.nombre',
                    Ev.[fechaInicio]    AS  'evento.inicio',
                    Ev.[fechaFin]       AS  'evento.fin',
                    Ev.[descripcion]    AS  'evento.descripcion',
                    Ev.[lugar]          AS  'evento.lugar',
                    Ct.[nombre]         AS  'evento.categoria',
                    A.[nombre]          AS  'asociacion.nombre',
                    Cr.[codigo]         AS  'asociacion.carrera',
                    S.[codigo]          AS  'asociacion.sede',
                    Es.[carnet]         AS  'estudiante.carnet',
                    Es.[nombre]         AS  'estudiante.nombre',
                    Es.[apellido1]      AS  'estudiante.apellido1',
                    Es.[apellido2]      AS  'estudiante.apellido2',
                    I.[timestamp]       AS  'inscripcion.fecha'
            FROM    [dbo].[Inscripciones] I
            INNER JOIN  [dbo].[Estudiantes] Es
                ON  I.[idEstudiante] = Es.[id]
            INNER JOIN  [dbo].[Eventos] Ev
                ON  I.[idEvento] = Ev.[id]
            INNER JOIN  [dbo].[Categorias] Ct
                ON  Ev.[idCategoria] = Ct.[id]
            INNER JOIN  [dbo].[Asociaciones] A
                ON  Ev.[idAsociacion] = A.[id]
            INNER JOIN  [dbo].[Carreras] Cr
                ON  A.[idCarrera] = Cr.[id]
            INNER JOIN  [dbo].[Sedes] S
                ON  Cr.[idSede] = S.[id]
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