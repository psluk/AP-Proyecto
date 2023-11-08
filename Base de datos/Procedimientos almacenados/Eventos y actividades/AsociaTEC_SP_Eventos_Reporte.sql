--------------------------------------------------------------------------
-- Autor:       Fabián Vargas
-- Fecha:       23-09-02
-- Descripción: Envia los datos del reporte sobre un evento
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Eventos_Reporte]
    @IN_uuid UNIQUEIDENTIFIER
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

    BEGIN TRY

        -- VALIDACIONES

        SELECT @ID_Evento = E.[id]
        FROM [dbo].[Eventos] E
        WHERE E.[uuid] = @IN_uuid
        AND E.[eliminado] = 0

        IF @ID_Evento IS NULL
        BEGIN
            DECLARE @uuid_varchar VARCHAR(36)= (SELECT CONVERT(NVARCHAR(36), @IN_uuid))
            RAISERROR('No existe ningún evento con el uuid %s.', 16, 1, @uuid_varchar);
        END

        SELECT @NUM_Inscripciones = COUNT(I.[id])
        FROM [dbo].[Inscripciones] I
        WHERE I.[idEvento] = @ID_Evento

		SELECT @Num_Confirmados = COUNT(I.[id])
        FROM [dbo].[Inscripciones] I
        WHERE I.[idEvento] = @ID_Evento
		AND I.[asistencia] = 1

		SELECT @Num_Cancelados = @Num_Inscripciones - @Num_Confirmados

		SELECT @Num_Compartidos = E.[compartido]
		FROM [dbo].[Eventos] E
		WHERE E.[id] = @ID_Evento

		SELECT @Num_Calificaciones = COUNT(E.id)
		FROM [dbo].[Encuestas] E
		INNER JOIN [dbo].[Inscripciones] I
		ON I.[id] = E.[idInscripcion]
		WHERE I.[idEvento] = @ID_Evento

		SELECT @Num_Calificaciones = SUM(E.[calificacion])
		FROM [dbo].[Encuestas] E
		INNER JOIN [dbo].[Inscripciones] I
		ON I.[id] = E.[idInscripcion]
		WHERE I.[idEvento] = @ID_Evento

        SELECT COALESCE
        (
            (SELECT @Num_Inscripciones AS 'inscripciones',
			        @Num_Confirmados AS 'confirmados',
			        @Num_Calificaciones AS 'cancelados',
			        @Num_Compartidos AS 'compartidos',
			        @Num_Calificaciones AS 'calificaciones',
                    @Num_Estrellas AS 'estrellas'
                    FOR JSON PATH
            ),
            '[]'
        ) as results

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