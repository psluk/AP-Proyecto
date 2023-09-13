--------------------------------------------------------------------------
-- Autor:       Fabián Vargas
-- Fecha:       23-09-02
-- Descripción: Modifica los detalles básicos de un evento
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Eventos_Modificar]
    @IN_Titulo VARCHAR(64),
    @IN_Descripcion VARCHAR(512),
    @IN_FechaInicio DATETIME,
    @IN_FechaFin DATETIME,
    @IN_Lugar VARCHAR(128),
    @IN_Especiales VARCHAR(256),
    @IN_Capacidad INT,
    @IN_Categoria VARCHAR(32),
    @IN_uuid UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccion_iniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
    DECLARE @ID_Evento INT = NULL
	DECLARE @ID_Categoria VARCHAR(32) = NULL

    BEGIN TRY

        -- VALIDACIONES
        IF NOT EXISTS 
        (
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

		SELECT @ID_Categoria = C.[id]
		FROM [dbo].[Categorias] C
		WHERE C.[nombre] = @IN_Categoria
        AND C.[eliminado] = 0

		IF @ID_Categoria IS NULL
		BEGIN
			RAISERROR('No existe la categoria: %s',16,1, @IN_Categoria)
		END

        IF LTRIM(RTRIM(@IN_Titulo)) = ''
        BEGIN
            RAISERROR('No se proporcionó un titulo', 16, 1);
        END;

        IF LTRIM(RTRIM(@IN_Descripcion)) = ''
        BEGIN
            RAISERROR('No se proporcionó una descripción', 16, 1);
        END;

        IF LTRIM(RTRIM(@IN_Especiales)) = ''
        BEGIN
            RAISERROR('No se proporcionó especiales', 16, 1);
        END;

        IF LTRIM(RTRIM(@IN_Lugar)) = ''
        BEGIN
            RAISERROR('No se proporcionó un lugar', 16, 1);
        END;

        -- INICIO DE LA TRANSACCIÓN
        IF @@TRANCOUNT = 0
        BEGIN
            SET @transaccion_iniciada = 1;
            BEGIN TRANSACTION;
        END;

        UPDATE E
        SET Titulo = @IN_Titulo,
            descripcion = @IN_Descripcion,
            fechaInicio = @IN_FechaInicio,
            fechaFin = @IN_FechaFin,
            lugar = @IN_Lugar,
            Especiales = @IN_Especiales,
            Capacidad = @IN_Capacidad,
            idCategoria = @ID_Categoria
        FROM [dbo].[Eventos] E
        WHERE E.[uuid] = @IN_uuid

        -- COMMIT DE LA TRANSACCIÓN
        IF @transaccion_iniciada = 1
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