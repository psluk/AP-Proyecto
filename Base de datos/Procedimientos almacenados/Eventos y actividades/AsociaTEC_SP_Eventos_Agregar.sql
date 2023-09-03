--------------------------------------------------------------------------
-- Autor:       Fabián Vargas
-- Fecha:       23-09-02
-- Descripción: Agrega un evento nuevo
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Nombre]
    @IN_Titulo VARCHAR(64),
    @IN_Descripcion VARCHAR(512),
    @IN_FechaInicio DATETIME,
    @IN_FechaFin DATETIME,
    @IN_Lugar VARCHAR(128),
    @IN_Especiales VARCHAR(256),
    @IN_Capacidad INT,
    @IN_Categoria VARCHAR(32),
    @IN_Sede VARCHAR(16),
    @IN_Carrera VARCHAR(4)

AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccion_iniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
    DECLARE @ID_Asociacion INT = NULL;
    DECLARE @ID_Categoria INT = NULL;
	DECLARE @ID_Sede INT = NULL;
	DECLARE @ID_Carrera INT = NULL;


    BEGIN TRY

        -- VALIDACIONES

		SELECT @ID_Sede = S.[id]
		FROM   [dbo].[Sedes] S
		WHERE S.[codigo] = @IN_Sede

		IF @ID_Sede IS NULL
        BEGIN
            RAISERROR('No existe la sede',50000, @IN_Sede)
        END

		SELECT @ID_Carrera = C.[id]
		FROM   [dbo].[Carreras] C
		WHERE C.[idSede] = @ID_Sede
		
		IF @ID_Carrera IS NULL
        BEGIN
            RAISERROR('No existe la carrera',50000, @IN_Carrera)
        END

		SELECT @ID_Asociacion = A.[id]
		FROM   [dbo].[Asociaciones] A
		WHERE  A.[idCarrera] = @ID_Carrera
        AND A.[eliminado] = 0

		IF @ID_Asociacion IS NULL
        BEGIN
            RAISERROR('No existe la asociación %s.%s',50000, @IN_Carrera,@IN_Sede)
        END

        SELECT @ID_Categoria = 
        (
            SELECT C.[id] 
            FROM [dbo].[Categorias] C
            WHERE C.[nombre] = @IN_Categoria
			AND C.[eliminado] = 0
        )

        IF @ID_Categoria IS NULL 
        BEGIN
            RAISERROR('No existe la categoria: %s',50000, @IN_Categoria)
        END

        -- INICIO DE LA TRANSACCIÓN
        IF @@TRANCOUNT = 0
        BEGIN
            SET @transaccion_iniciada = 1;
            BEGIN TRANSACTION;
        END;

        INSERT INTO [dbo].[Eventos]
        (
            idAsociacion,
            idCategoria,
            uuid,
            titulo,
            descripcion,
            fechaInicio,
            fechaFin,
            lugar,
            especiales,
            capacidad,
            eliminado
        )
        VALUES
        (
            @ID_Asociacion,
            @ID_Categoria,
            NEWID(),
            @IN_Titulo,
            @IN_Descripcion,
            @IN_FechaInicio,
            @IN_FechaFin,
            @IN_Lugar,
            @IN_Especiales,
            @IN_Capacidad,
            0
        )

        -- COMMIT DE LA TRANSACCIÓN
        IF @transaccion_iniciada = 1
        BEGIN
            COMMIT TRANSACTION;
        END;

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