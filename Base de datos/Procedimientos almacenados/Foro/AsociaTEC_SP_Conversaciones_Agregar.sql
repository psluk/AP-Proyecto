--------------------------------------------------------------------------
-- Autor:       Luis Fernando Molina
-- Fecha:       2023-09-03
-- Descripci�n: agregamos una nueva conversacion y sus tags respectivos
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Conversaciones_Agregar]
    -- Par�metros
	@IN_correo VARCHAR(128),
	@IN_titulo VARCHAR(64),
	@IN_tags Tags READONLY
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACI�N DE VARIABLES
	DECLARE @usarIDUsuario INT = NULL;
	DECLARE @usarTags BIT = 0;
	DECLARE @usarIDConversacion INT = NULL;
	DECLARE @tempTagsID TABLE(
				[in_tags] VARCHAR(32) NOT NULL,
				[id] INT
			);

    BEGIN TRY

        -- VALIDACIONES

		IF (LTRIM(RTRIM(@IN_correo)) = '')
        BEGIN
            -- correo vacio
            RAISERROR('El correo esta vacio.', 16, 1);
        END;

		SELECT @usarIDUsuario = U.[id]
		FROM [dbo].[Usuarios] U
		WHERE U.[correo] = @IN_correo
		AND U.[eliminado] = 0

		IF(@usarIDUsuario IS NULL)
		BEGIN
			-- Identificador inexistente
            RAISERROR('El usuario con el correo "%s" no existe', 16, 1, @IN_correo);
		END;

		IF (LTRIM(RTRIM(@IN_titulo)) = '')
        BEGIN
            -- mensaje vacio
            RAISERROR('El titulo esta vacio.', 16, 1);
        END;


		IF EXISTS (SELECT TOP 1 1 FROM @IN_tags) 
		BEGIN
			SET @usarTags = 1;
		END;

		IF(@usarTags = 1)
		BEGIN

			INSERT INTO @tempTagsID (
				[in_tags], 
				[id])
			SELECT 
				LTRIM(RTRIM(It.[IN_tags])) AS 'etiqueta' ,
				CASE WHEN LTRIM(RTRIM(E.[etiqueta])) = LTRIM(RTRIM(It.[IN_tags]))  COLLATE Latin1_General_CI_AI
					THEN E.[id]
					ELSE NULL END AS 'id'
			FROM [dbo].[Etiquetas] E
			RIGHT JOIN @IN_tags It
				ON LTRIM(RTRIM(E.[etiqueta])) = LTRIM(RTRIM(It.[IN_tags]))  COLLATE Latin1_General_CI_AI; -- Para omitir tildes
		END;


		-- INICIO DE LA TRANSACCIÓN
        IF @@TRANCOUNT = 0
        BEGIN
            SET @transaccionIniciada = 1;
            BEGIN TRANSACTION;
        END;
		
		IF(@usarTags = 1)
		BEGIN
			--insertamos las nuevas etiquetas
			INSERT INTO [dbo].[Etiquetas](
				[etiqueta]
			)
			SELECT LTRIM(RTRIM(tTID.[in_tags]))
			FROM @tempTagsID tTID
			WHERE tTID.[id] IS NULL;
		END;

		-- creamos la nueva conversacion
		INSERT INTO [dbo].[Conversaciones] (
			[idUsuario], 
			[uuid], 
			[titulo], 
			[timestamp], 
			[cerrado], 
			[eliminado]
		)
		VALUES(
			@usarIDUsuario,
			NEWID(),
			@IN_titulo,
			LTRIM(RTRIM(GETDATE())),
			0,
			0
		);

		SET @usarIDConversacion = SCOPE_IDENTITY();


		IF(@usarTags = 1)
		BEGIN
			--asociamos las etiquetas a la conversacion
			INSERT INTO [dbo].[EtiquetasDeConversacion](
				[idEtiqueta], 
				[idConversacion], 
				[eliminado]
			)
			SELECT ideti.[id], 
				   @usarIDConversacion,
				   0
			FROM (
					SELECT E.[id] AS 'id'
					FROM [dbo].[Etiquetas] E
					INNER JOIN @IN_tags It
						ON LTRIM(RTRIM(E.[etiqueta])) = LTRIM(RTRIM(It.[IN_tags]))  COLLATE Latin1_General_CI_AI
				) AS ideti -- Para omitir tildes
		END;

        -- COMMIT DE LA TRANSACCIÓN
        IF @transaccionIniciada = 1
        BEGIN
            COMMIT TRANSACTION;
        END;

		SELECT 1;

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