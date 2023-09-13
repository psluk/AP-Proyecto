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
    DECLARE @ID_Evento INT = NULL;


    BEGIN TRY

        -- VALIDACIONES
        IF NOT EXISTS(
        SELECT 1
        FROM [dbo].[Actividades] A
        WHERE A.[uuid] = @IN_uuid
        AND A.[eliminado] = 0
        )
        BEGIN
            RAISERROR('No existe la actividad deseada a modificar', 16, 1)
        END

        SELECT @ID_Evento = A.[idEvento]
        FROM dbo.Actividades A
        WHERE A.uuid = @IN_uuid

        IF @IN_fechaFin <= @IN_fechaInicio
        BEGIN
            RAISERROR('La fecha de fin debe ser posterior a la fecha de inicio', 16, 1);
        END

        IF NOT EXISTS (
            SELECT 1
            FROM [dbo].[Eventos] E
            WHERE E.[id] = @ID_Evento
            AND @IN_fechaInicio >= E.[fechaInicio]
            AND @IN_FechaFin <= E.[fechaFin]
        )
        BEGIN
            RAISERROR('Las fechas de inicio y fin de la actividad no están dentro del rango permitido para el evento', 16, 1)
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

        -- Se devuelve la lista de correos de aquellos usuarios
        -- inscritos al evento o que lo tienen marcado como
        -- evento de interés, para notificarlos del cambio
        SELECT (
                SELECT  A.[nombre] AS 'asociacion.nombre',
                Ev.[titulo] AS 'evento.titulo',
                Ev.[fechaInicio] AS 'evento.inicio',
                Ev.[fechaFin] AS 'evento.fin',
                (SELECT COALESCE(
                    (SELECT DISTINCT 
                            U.[correo]  AS 'correo'
                    FROM    [dbo].[Eventos] Ev2
                    LEFT JOIN [dbo].[Inscripciones] I
                        ON  I.[idEvento] = Ev2.[id]
                    LEFT JOIN [dbo].[EventosDeInteres] It
                        ON  It.[idEvento] = Ev2.[id]
                    LEFT JOIN [dbo].[Estudiantes] E
                        ON  I.[idEstudiante] = E.[id]
                        OR  It.[idEstudiante] = E.[id]
                    INNER JOIN [dbo].[Usuarios] U
                        ON  E.[idUsuario] = U.[id]
                    WHERE   I.[eliminado] = 0
                        AND It.[eliminado] = 0
                        AND Ev2.[id] = @ID_Evento
                    FOR JSON PATH),
                    '[]'    -- Por defecto, si no hay resultados, no retorna nada, entonces esto hace
                            -- que el JSON retornado sea un arreglo vacío
                    )
                ) AS 'evento.correos'
                FROM [dbo].[Eventos] Ev
                INNER JOIN [dbo].[Asociaciones] A
                    ON  Ev.[idAsociacion] = A.[id]
                WHERE Ev.[id] = @ID_Evento
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