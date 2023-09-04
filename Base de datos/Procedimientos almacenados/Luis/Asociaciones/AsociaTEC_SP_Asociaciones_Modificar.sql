--------------------------------------------------------------------------
-- Autor:       Luis Fernando Molina
-- Fecha:       2023-09-03
-- Descripci�n: modificamos los valores de una asociacion
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Asociaciones_Modificar]
    -- Par�metros
	@IN_correoActual VARCHAR(128),
	@IN_nombreNueva VARCHAR(64) = NULL,
	@IN_descripcionNueva VARCHAR(256) = NULL,
	@IN_telefonoNueva VARCHAR(16) = NULL,
	@IN_codigoSedeNueva VARCHAR(4) = NULL,
    @IN_codigoCarreraNueva VARCHAR(4) = NULL,
	@IN_correoNueva VARCHAR(128) = NULL,
	@IN_claveNueva VARCHAR(64) = NULL
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACI�N DE VARIABLES
	DECLARE @usarTipoAsociacion VARCHAR(16) = 'Asocia%';
	DECLARE @usarIDUsuario INT = NULL;
	DECLARE @usarIDAsociacion INT = NULL;
	DECLARE @usarIDCarrera INT = NULL;
	DECLARE @usarIDSede INT = NULL;

    BEGIN TRY

		-- VALIDACIONES

        IF (LTRIM(RTRIM(@IN_correoActual)) = '')
        BEGIN
            RAISERROR('No se brindó un correo electrónico', 16, 1)
        END;

		IF EXISTS ( SELECT  1
                    FROM    [dbo].[Usuarios] U
                    WHERE   U.[correo] = @IN_correoActual
                        AND U.[eliminado] = 0 )
        BEGIN
            RAISERROR('Ya existe un usuario con el correo "%s"', 16, 1, @IN_correoActual)
        END;

        IF (@IN_correoActual NOT LIKE '%@estudiantec.cr' OR LTRIM(RTRIM(@IN_correoActual)) = '@estudiantec.cr')
        BEGIN
            RAISERROR('El correo "%s" no pertenece al dominio @estudiantec.cr', 16, 1, @IN_correoActual);
        END;

		--revisamos si existe el usuario como asociacion
		
		SELECT @usarIDUsuario = U.[id], @usarIDAsociacion = A.[id]
			FROM [dbo].[Usuarios] U
			INNER JOIN [dbo].[TiposUsuario] Tu
				ON Tu.[nombre] LIKE @usarTipoAsociacion
			INNER JOIN [dbo].[Asociaciones] A
				ON A.[idUsuario] = U.[id]
			WHERE U.[correo] = @IN_correoActual
			AND Tu.[nombre] LIKE @usarTipoAsociacion

		IF ((@usarIDUsuario IS NULL) OR (@usarIDAsociacion IS NULL))
		BEGIN
			RAISERROR('El correo "%s" no corresponde a ninguna asociacion', 16, 1, @IN_correoActual);
		END;

		--obtenemos los ID de la Sede y carrera nuevos

		SELECT @usarIDCarrera = C.[id], @usarIDSede = S.[id]
		FROM [dbo].[Carreras] C
		INNER JOIN [dbo].[Sedes] S
			ON S.[id] = C.[idSede]
		WHERE @IN_codigoCarreraNueva = C.[codigo]
		AND @IN_codigoSedeNueva = S.[codigo]

		IF ((@usarIDCarrera IS NULL) OR (@usarIDSede IS NULL))
		BEGIN
			RAISERROR('los codigos de la carrera o sede estan erroneos', 16, 1);
		END;



		-- INICIO DE LA TRANSACCI�N
		IF @@TRANCOUNT = 0
		BEGIN
		    SET @transaccionIniciada = 1;
		    BEGIN TRANSACTION;
		END;
			
			--actualizamos las asociaciones
			UPDATE A
			SET A.[idCarrera] = CASE WHEN @usarIDCarrera != NULL THEN @usarIDCarrera
									 ELSE A.[idCarrera] END,
				A.[nombre] = CASE WHEN @IN_nombreNueva != NULL THEN @IN_nombreNueva
									 ELSE A.[nombre] END,
				A.[descripcion] = CASE WHEN @IN_descripcionNueva != NULL THEN @IN_descripcionNueva
									 ELSE A.[descripcion] END,
				A.[telefono] = CASE WHEN @IN_telefonoNueva != NULL THEN @IN_telefonoNueva
									 ELSE A.[telefono] END
			FROM[dbo].[Asociaciones] A
			WHERE A.[idUsuario] = @usarIDUsuario

			--actualizamos a el usuario
			UPDATE U
			SET U.[correo] = CASE WHEN @IN_correoNueva != NULL THEN @IN_correoNueva
									 ELSE U.[correo] END,
			    U.[clave] = CASE WHEN @IN_claveNueva != NULL THEN @IN_claveNueva
									 ELSE U.[clave] END
			FROM [dbo].[Usuarios] U
			WHERE U.[id] = @usarIDUsuario


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