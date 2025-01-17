--------------------------------------------------------------------------
-- Autor:       Paúl Rodríguez García
-- Fecha:       2023-08-30
-- Descripción: Inscribe a un estudiante a un evento.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Inscripciones_Agregar]
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

        IF EXISTS ( SELECT  1
                    FROM    [dbo].[Inscripciones] I
                    WHERE   I.[idEvento] = @idEvento
                        AND I.[idEstudiante] = @idEstudiante
                        AND I.[eliminado] = 0 )
        BEGIN
            RAISERROR('El estudiante ya tiene una inscripción para este evento', 16, 1);
        END;

        IF (SELECT  E.[fechaFin]
            FROM    [dbo].[Eventos] E
            WHERE   E.[id] = @idEvento
                AND E.[eliminado] = 0 ) < GETUTCDATE()
        BEGIN
            RAISERROR('No es posible inscribirse a un evento pasado', 16, 1);
        END;

        IF (SELECT  COUNT(I.[id])
            FROM    [dbo].[Inscripciones] I
            WHERE   I.[idEvento] = @idEvento
                AND I.[eliminado] = 0 )
            >=
           (SELECT  E.[capacidad]
            FROM    [dbo].[Eventos] E
            WHERE   E.[id] = @idEvento
                AND E.[eliminado] = 0 )
        BEGIN
            RAISERROR('No hay más espacios disponibles en este evento', 16, 1);
        END;

        -- INICIO DE LA TRANSACCIÓN
        IF @@TRANCOUNT = 0
        BEGIN
            SET @transaccionIniciada = 1;
            BEGIN TRANSACTION;
        END;

            INSERT INTO [dbo].[Inscripciones]
            (
                [idEvento],
                [idEstudiante],
                [asistencia],
                [timestamp],
                [eliminado]
            )
            VALUES
            (
                @idEvento,
                @idEstudiante,
                0,
                GETUTCDATE(),
                0
            );

            -- Agrega el evento como evento de interés automáticamente
            IF NOT EXISTS ( SELECT  1
                            FROM    [dbo].[EventosDeInteres] EdI
                            WHERE   EdI.[idEvento] = @idEvento
                                AND EdI.[idEstudiante] = @idEstudiante
                                AND EdI.[eliminado] = 0 )
            BEGIN
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
            END;

        -- COMMIT DE LA TRANSACCIÓN
        IF @transaccionIniciada = 1
        BEGIN
            COMMIT TRANSACTION;
        END;

        SELECT (
            SELECT  CAST(
                (   CASE (  SELECT  COUNT(I.[id])
                            FROM    [dbo].[Inscripciones] I
                            WHERE   I.[idEvento] = @idEvento
                                AND I.[eliminado] = 0)
                    WHEN (  (SELECT  E2.[capacidad]
                            FROM    [dbo].[Eventos] E2
                            WHERE   E2.[id] = @idEvento
                                AND E2.[eliminado] = 0 ))
                    THEN    1
                    ELSE    0
                    END
                )   AS BIT) AS 'maximoAlcanzado',
                A.[nombre]  AS 'asociacion.nombre',
                U.[correo]  AS 'asociacion.correo',
                E.[titulo]  AS 'evento.titulo',
                E.[capacidad] AS 'evento.capacidad',
                (SELECT  MAX(I.[timestamp])
                FROM    [dbo].[Inscripciones] I
                WHERE   I.[idEvento] = @idEvento
                    AND I.[eliminado] = 0)  AS 'timestamp'
            FROM    [dbo].[Eventos] E
            INNER JOIN  [dbo].[Asociaciones] A
                ON  E.[idAsociacion] = A.[id]
            INNER JOIN  [dbo].[Usuarios] U
                ON  A.[idUsuario] = U.[id]
            WHERE   E.[id] = @idEvento
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