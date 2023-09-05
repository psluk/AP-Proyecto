--------------------------------------------------------------------------
-- Autor:       Luis Fernando Molina
-- Fecha:       2023-09-03
-- Descripción: Retorna la lista de las conversaciones
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Conversaciones_Lista]
    -- Parámetros
    @IN_titulo VARCHAR(64) = NULL,
    @IN_tags Tags READONLY
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
	DECLARE @usartitulo BIT = 0;
	DECLARE @usartags BIT = 0;
	DECLARE @usarSeparador VARCHAR(1) = ' ';

    BEGIN TRY

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
            (SELECT C.[titulo] AS 'titulo',
			   C.[uuid] AS 'identificador',
			   C.[timestamp] AS 'timestamp',
			   datos.tags AS 'tags'
			FROM(SELECT C.[id] AS 'idConversacion', STRING_AGG( E.[etiqueta], @usarSeparador) AS 'tags' 
			FROM [dbo].[Conversaciones] C
			INNER JOIN [dbo].[EtiquetasDeConversacion] EdC
				ON EdC.[idConversacion] = C.[id]
			INNER JOIN [dbo].[Etiquetas] E
				ON E.[id] = EdC.[idEtiqueta]
			INNER JOIN @IN_tags It
			ON 1=1
			WHERE (@usartitulo = 0 
				  OR C.[titulo] = LTRIM(RTRIM(@IN_titulo))) 
			AND (@usartags = 0 
				OR E.[etiqueta] COLLATE Latin1_General_CI_AI  -- Para omitir tildes
					LIKE '%' + LTRIM(RTRIM(It.[IN_tags])) + '%')
			AND C.[eliminado] = 0
			AND EdC.[eliminado] = 0
			GROUP BY C.[id]) AS datos
			INNER JOIN [dbo].[Conversaciones] C
				ON datos.[idConversacion] = C.[id]
            ORDER BY C.[titulo], C.[timestamp] ASC
            FOR JSON PATH),
		'[]'    -- Por defecto, si no hay resultados, no retorna nada, entonces esto hace
                -- que el JSON retornado sea un arreglo vacío
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