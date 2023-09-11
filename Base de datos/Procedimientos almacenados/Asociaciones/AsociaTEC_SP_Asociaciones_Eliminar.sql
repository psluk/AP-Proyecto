	--------------------------------------------------------------------------
-- Autor:       Luis Fernando Molina
-- Fecha:       2023-09-03
-- Descripci�n: eliminamos una asociacion
--------------------------------------------------------------------------

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
	DECLARE @usarTipoAsociacion VARCHAR(16) = 'Asocia%';
	DECLARE @usarCiclo INT = 1;
	DECLARE @usarseleccionar INT = 0;
	DECLARE @usartempIdentificador UNIQUEIDENTIFIER = NULL;

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
				  WHERE U.[correo] = LTRIM(RTRIM(@IN_correo))
				  AND Tu.[nombre] LIKE @usarTipoAsociacion
				  AND U.[eliminado] = 0
				  AND A.[eliminado] = 0)
				  
		BEGIN
			RAISERROR('El correo "%s" no corresponde a ninguna asociacion', 16, 1, @IN_correo);
		END;


		-- INICIO DE LA TRANSACCI�N
		IF @@TRANCOUNT = 0
		BEGIN
		    SET @transaccionIniciada = 1;
		    BEGIN TRANSACTION;
		END;
			
			WHILE @usarCiclo = 1
			BEGIN
				BEGIN TRY
					IF (@usarseleccionar = 0) -- eliminamos las propuestas
						BEGIN
							SELECT TOP 1 @usartempIdentificador = P.[uuid]
							FROM [dbo].[Propuestas] P
							INNER JOIN [dbo].[Asociaciones] A
								ON A.[id] = P.[idAsociacion]
							INNER JOIN [dbo].[Usuarios] U
								ON  A.[idUsuario] = U.id
							WHERE U.[correo] = LTRIM(RTRIM(@IN_correo)) 
							AND A.[eliminado] = 0
							AND U.[eliminado] = 0
							AND P.[eliminado] = 0;
						
							EXEC [dbo].[AsociaTEC_SP_Propuestas_Eliminar] @usartempIdentificador
						END;
					IF (@usarseleccionar = 1) --eliminamos (estudiantes de asociacion)
						BEGIN 
						
							UPDATE EdA
							SET EdA.[eliminado] = 0
							FROM [dbo].[EstudiantesDeAsociacion] EdA
							INNER JOIN [dbo].[Asociaciones] A
								ON A.[id] = EdA.[idAsociacion]
							INNER JOIN [dbo].[Usuarios] U
								ON  A.[idUsuario] = U.id
							WHERE U.[correo] = LTRIM(RTRIM(@IN_correo)) 
							AND A.[eliminado] = 0
							AND U.[eliminado] = 0
							AND EdA.[eliminado] = 0;

							SET @usarseleccionar = @usarseleccionar + 1;
						END;
					IF (@usarseleccionar = 2) -- eliminacion de evento
						BEGIN 
							SELECT TOP 1 @usartempIdentificador = E.[uuid]
								FROM [dbo].[Eventos] E
								INNER JOIN [dbo].[Asociaciones] A
									ON A.[id] = E.[idAsociacion]
								INNER JOIN [dbo].[Usuarios] U
									ON  A.[idUsuario] = U.id
								WHERE U.[correo] = LTRIM(RTRIM(@IN_correo)) 
								AND A.[eliminado] = 0
								AND U.[eliminado] = 0
								AND E.[eliminado] = 0;
							
							EXEC [dbo].[AsociaTEC_SP_Eventos_Eliminar] @usartempIdentificador;
						END;
					IF (@usarseleccionar = 3) -- eliminacion de conversaciones y mensajes
						BEGIN 
							SELECT TOP 1 @usartempIdentificador = C.[uuid]
							FROM [dbo].[Conversaciones] C
							INNER JOIN [dbo].[Usuarios] U
								ON  C.[idUsuario] = U.id
							WHERE U.[correo] = LTRIM(RTRIM(@IN_correo)) 
							AND C.[eliminado] = 0
							AND U.eliminado = 0;
							
							EXEC [dbo].[AsociaTEC_SP_Conversaciones_Eliminar] @usartempIdentificador;
						END;

					IF (@usarseleccionar = 4) -- eliminacion de asociacion y usuario
						BEGIN 
							UPDATE A
							SET A.[eliminado] = 1
							FROM [dbo].[Asociaciones] A
							INNER JOIN [dbo].[Usuarios] U
								ON U.[id] = A.[idUsuario]
							WHERE U.[correo] = LTRIM(RTRIM(@IN_correo))
							AND A.[eliminado] = 0
							AND U.eliminado = 0;

							UPDATE U
							SET U.[eliminado] = 1
							FROM [dbo].[Usuarios] U
							WHERE U.[correo] = LTRIM(RTRIM(@IN_correo))
							AND U.eliminado = 0;

							SET @usarseleccionar = @usarseleccionar + 1;
						END;

					ELSE
						BEGIN
							SET @usarCiclo = 0; -- condicion parada
						END;
				END TRY
				BEGIN CATCH
					SET @usarseleccionar = @usarseleccionar + 1
				END CATCH;
			END;

		-- COMMIT DE LA TRANSACCI�N
		IF @transaccionIniciada = 1
		BEGIN
		    COMMIT TRANSACTION;
		END;

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