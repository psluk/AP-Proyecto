--------------------------------------------------------------------------
-- Autor:       Paúl Rodríguez García
-- Fecha:       2023-11-15
-- Descripción: Obtiene el siguiente evento para notificar
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Eventos_Notificar]
    -- PARÁMETROS
    @IN_minutosAntes INT = 0,           -- Minutos antes del siguiente evento para notificar
    @IN_fechaInicio DATETIME = NULL     -- Fecha de inicio de los eventos para notificar
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccion_iniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
    DECLARE @ID_Evento  INT = NULL;
    DECLARE @Num_Inscripciones INT = 0;
    DECLARE @Num_Confirmados INT = 0;
    DECLARE @Num_Cancelados INT = 0;
    DECLARE @Num_Compartidos INT = 0;
    DECLARE @Num_Calificaciones INT = 0;
    DECLARE @Num_Estrellas INT = 0;
    DECLARE @eventos VARCHAR(MAX) = NULL;

    BEGIN TRY

        -- Eventos por notificar a esta hora
        IF @IN_fechaInicio IS NOT NULL
        BEGIN
            SET @eventos = 
            (SELECT  E.[uuid] AS 'uuid',
                    E.[titulo] AS 'titulo',
                -- Se agregan los correos de los estudiantes inscritos al evento
                (
                    SELECT  U.[correo]
                    FROM    [dbo].[Inscripciones] I
                    INNER JOIN [dbo].[Estudiantes] Est
                        ON  I.[idEstudiante] = Est.[id]
                    INNER JOIN [dbo].[Usuarios] U
                        ON  U.[id] = Est.[idUsuario]
                    WHERE I.[idEvento] = E.[id]
                        AND I.[eliminado] = 0
                    FOR JSON PATH
                )   AS 'inscripciones',
                -- Se agregan los correos de los estudiantes interesados en el evento
                (
                    SELECT  U.[correo]
                    FROM    [dbo].[EventosDeInteres] EdI
                    INNER JOIN [dbo].[Estudiantes] Est
                        ON  EdI.[idEstudiante] = Est.[id]
                    INNER JOIN [dbo].[Usuarios] U
                        ON  U.[id] = Est.[idUsuario]
                    WHERE EdI.[idEvento] = E.[id]
                        AND EdI.[eliminado] = 0
                        AND (
                            SELECT COUNT(*)
                            FROM [dbo].[Inscripciones] I
                            WHERE I.[idEvento] = E.[id]
                                AND I.[idEstudiante] = EdI.[idEstudiante]
                                AND I.[eliminado] = 0
                        ) = 0       -- No incluye las inscripciones, para evitar duplicados
                    FOR JSON PATH
                )   AS 'interes'
            FROM [dbo].[Eventos] E
            WHERE E.[eliminado] = 0 AND E.[fechaInicio] = @IN_fechaInicio
            FOR JSON PATH);
        END;

        SELECT  @eventos AS 'eventos',
                (-- Siguiente hora para notificar
                SELECT TOP 1
                    E.[fechaInicio]
                FROM [dbo].[Eventos] E
                INNER JOIN [dbo].[Inscripciones] I ON E.[id] = I.[idEvento]
                WHERE I.[eliminado] = 0 AND E.[fechaInicio] > DATEADD(MINUTE, @IN_minutosAntes, GETUTCDATE())
                ORDER BY E.[fechaInicio] ASC) AS 'siguienteHora';

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