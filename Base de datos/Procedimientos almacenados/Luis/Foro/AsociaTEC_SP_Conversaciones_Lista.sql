--------------------------------------------------------------------------
-- Autor:       Luis Fernando Molina
-- Fecha:       2023-09-03
-- Descripci�n: Retorna la lista de las conversaciones
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Conversaciones_Lista]
    -- Par�metros
    @IN_titulo VARCHAR(64) = NULL,
    @IN_tags Tags READONLY
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACI�N DE VARIABLES
	DECLARE @usartitulo BIT = 0;
	DECLARE @usartags BIT = 0;

    BEGIN TRY

		--REALIZAR LAS VALIDACIONES

        -- VALIDACIONES

		IF NOT ((LTRIM(RTRIM(@IN_titulo)) = '') OR (@IN_titulo IS NULL))
        BEGIN
            -- el titulo se usara como filtro
            SET @usartitulo = 1;
        END;

		IF EXISTS( SELECT 1 FROM @IN_tags )
		BEGIN
			-- los tags se usara como filtro
            SET @usartags = 1;
		END;


		SELECT COALESCE(
            (SELECT C.[titulo] AS 'conversacion.titulo',
			   C.[uuid] AS 'conversacion.identificador',
			   C.[timestamp] AS 'conversacion.timestamp',
			   E.[etiqueta] AS 'tags.etiqueta'
			FROM [dbo].[Conversaciones] C
			INNER JOIN [dbo].[EtiquetasDeConversacion] EdC
				ON EdC.[idConversacion] = C.[id]
			INNER JOIN [dbo].[Etiquetas] E
				ON E.[id] = EdC.[idEtiqueta]
			INNER JOIN @IN_tags It
			ON 1=1
			WHERE (@usartitulo = 0 OR C.[titulo] = @IN_titulo) 
			AND (@usartags = 0 
				OR E.[etiqueta] COLLATE Latin1_General_CI_AI  -- Para omitir tildes
					LIKE '%' + It.[IN_tags] + '%')
			AND C.[eliminado] = 0
			AND EdC.[eliminado] = 0
            ORDER BY C.[titulo], C.[timestamp] ASC
            FOR JSON PATH),
		'[]'    -- Por defecto, si no hay resultados, no retorna nada, entonces esto hace
                -- que el JSON retornado sea un arreglo vac�o
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