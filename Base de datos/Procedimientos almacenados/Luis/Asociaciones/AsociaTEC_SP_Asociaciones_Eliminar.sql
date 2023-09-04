--------------------------------------------------------------------------
-- Autor:       Luis Fernando Molina
-- Fecha:       2023-09-03
-- Descripci�n: eliminamos una asociacion nueva
--------------------------------------------------------------------------
--AsociaTEC_SP_Asociaciones_Eliminar [correo] (desactiva a la asociacion)

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Asociaciones_Eliminar]
    -- Par�metros
	@IN_correo VARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACI�N DE VARIABLES
	DECLARE @usarTipoAsociacion VARCHAR(16) = 'Asocia%'

    BEGIN TRY

		-- VALIDACIONES


        IF (LTRIM(RTRIM(@IN_correo)) = '')
        BEGIN
            RAISERROR('No se brindó un correo electrónico', 16, 1)
        END;

		--revisamos si existe el usuario como asociacion
		
		IF NOT EXISTS (SELECT 1 
				  FROM [dbo].[Usuarios] U
				  INNER JOIN [dbo].[TiposUsuario] Tu
					ON Tu.[nombre] LIKE @usarTipoAsociacion
				  INNER JOIN [dbo].[Asociaciones] A
					ON A.[idUsuario] = U.[id]
				  WHERE U.[correo] = @IN_correo
				  AND Tu.[nombre] LIKE @usarTipoAsociacion)
		BEGIN
			RAISERROR('El correo "%s" no corresponde a ninguna asociacion', 16, 1, @IN_correo);
		END;


		-- INICIO DE LA TRANSACCI�N
		IF @@TRANCOUNT = 0
		BEGIN
		    SET @transaccionIniciada = 1;
		    BEGIN TRANSACTION;
		END;
			
			--eliminamos propuestas
			
			--eliminamos estudiantes de asociacion

			--exec eventos

			--eliminamos asociacion

			--exec conversaciones
		    
			--exec mensajes


		-- COMMIT DE LA TRANSACCI�N
		IF @transaccionIniciada = 1
		BEGIN
		    COMMIT TRANSACTION;
		END;


		SELECT 1

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