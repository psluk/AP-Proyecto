--------------------------------------------------------------------------
-- Autor:       Fabián Vargas
-- Fecha:       23-09-02
-- Descripción: Elimina un evento
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Eventos_Eliminar]
    @IN_uuid UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccion_iniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
    DECLARE @ID_Evento INT = NULL;
    DECLARE @salida VARCHAR(MAX) = '';

    BEGIN TRY

        -- VALIDACIONES
        --

        IF NOT EXISTS(
            SELECT 1
            FROM [dbo].[Eventos] E
            WHERE E.[uuid] = @IN_uuid
            AND E.[eliminado] = 0
        )
        BEGIN
            DECLARE @uuid_varchar VARCHAR(36)= (SELECT CONVERT(NVARCHAR(36), @IN_uuid))
            RAISERROR('No existe ningún evento con el uuid %s.', 16, 1, @uuid_varchar);
        END

        SELECT  @ID_Evento = E.[id]
        FROM    [dbo].[Eventos] E
        WHERE   E.[uuid] = @IN_uuid
            AND E.[eliminado] = 0;

        -- Se devuelve la lista de correos de aquellos usuarios
        -- inscritos al evento o que lo tienen marcado como
        -- evento de interés, para notificarlos del cambio
        SELECT @salida = (
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
        );

        -- INICIO DE LA TRANSACCIÓN
        IF @@TRANCOUNT = 0
        BEGIN
            SET @transaccion_iniciada = 1;
            BEGIN TRANSACTION;
        END;

        UPDATE E
        SET E.[eliminado] = 1
        FROM [dbo].[Eventos] E
        WHERE E.[uuid] = @IN_uuid

        UPDATE I
        SET I.[eliminado] = 1
        FROM [dbo].[Inscripciones] I
        INNER JOIN [dbo].[Eventos] E
            ON  E.[id] = I.[idEvento]
        WHERE E.[uuid] = @IN_uuid;

        UPDATE I
        SET I.[eliminado] = 1
        FROM [dbo].[EventosDeInteres] I
        INNER JOIN [dbo].[Eventos] E
            ON  E.[id] = I.[idEvento]
        WHERE E.[uuid] = @IN_uuid;

        -- COMMIT DE LA TRANSACCIÓN
        IF @transaccion_iniciada = 1
        BEGIN
            COMMIT TRANSACTION;
        END;

        SELECT @salida AS 'results';

    END TRY
    BEGIN CATCH

        SET @ErrorNumber = ERROR_NUMBER();
        SET @ErrorSeverity = ERROR_SEVERITY();
        SET @ErrorState = ERROR_STATE();
        SET @Message = ERROR_MESSAGE();

        IF @transaccion_iniciada = 1
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