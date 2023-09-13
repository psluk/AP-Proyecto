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
	DECLARE @usarIDCarreraActual INT = NULL;
	DECLARE @usarIDSedeActual INT = NULL;

    BEGIN TRY

		-- VALIDACIONES

        IF (LTRIM(RTRIM(@IN_correoActual)) = '')
        BEGIN
            RAISERROR('No se brindó un correo electrónico identificador del usuario', 16, 1);
        END;

		--revisamos si existe el usuario como asociacion
		
		SELECT @usarIDUsuario = U.[id], @usarIDAsociacion = A.[id]
			FROM [dbo].[Usuarios] U
			INNER JOIN [dbo].[TiposUsuario] Tu
				ON Tu.[id] = U.[idTipoUsuario]
			INNER JOIN [dbo].[Asociaciones] A
				ON A.[idUsuario] = U.[id]
			WHERE U.[correo] = LTRIM(RTRIM(@IN_correoActual))
			AND Tu.[nombre] LIKE @usarTipoAsociacion
			AND U.[eliminado] = 0
			AND A.[eliminado] = 0

		IF ((@usarIDUsuario IS NULL) OR (@usarIDAsociacion IS NULL))
		BEGIN
			RAISERROR('El correo "%s" no corresponde a ninguna asociacion', 16, 1, @IN_correoActual);
		END;

		IF EXISTS ( SELECT  1
                    FROM    [dbo].[Usuarios] U
                    WHERE   U.[correo] = @IN_correoNueva
                        AND U.[eliminado] = 0
						AND U.[id] != @usarIDUsuario )
        BEGIN
            RAISERROR('Ya existe un usuario con el correo "%s"', 16, 1, @IN_correoNueva);
        END;

        IF (LTRIM(RTRIM(@IN_correoNueva)) NOT LIKE '%@itcr.ac.cr' AND LTRIM(RTRIM(@IN_correoNueva)) NOT LIKE '%@estudiantec.cr')
        BEGIN
            RAISERROR('El correo "%s" no pertenece al dominio @estudiantec.cr ni @itcr.ac.cr', 16, 1, @IN_correoNueva);
        END;


		--obtenemos el ID de la Carrera y Sede actuales

		SELECT @usarIDCarreraActual = C.[id], @usarIDSedeActual = S.[id]
		FROM [dbo].[Carreras] C 
		INNER JOIN [dbo].[Sedes] S 
			ON S.[id] = C.[idSede]  
		INNER JOIN [dbo].[Asociaciones] A 
			ON A.[idCarrera] = C.[id] 
		INNER JOIN [dbo].[Usuarios] U 
			ON U.[id] = A.[idUsuario] 
		WHERE U.[correo] = LTRIM(RTRIM(@IN_correoActual))

		-- ambos no existen
		IF( (@IN_codigoCarreraNueva IS NULL 
				OR LTRIM(RTRIM(@IN_codigoCarreraNueva)) = '') 
			AND (@IN_codigoSedeNueva IS NULL 
			   	OR LTRIM(RTRIM(@IN_codigoSedeNueva)) = '') )
		BEGIN
			SET @usarIDSede = @usarIDSedeActual;
			SET @usarIDCarrera = @usarIDCarreraActual;
		END;


		-- solo existe como C
		IF( (@IN_codigoCarreraNueva IS NULL 
				OR LTRIM(RTRIM(@IN_codigoCarreraNueva)) = '') 
			AND (@IN_codigoSedeNueva IS NOT NULL 
			   	OR LTRIM(RTRIM(@IN_codigoSedeNueva)) != '') )
		BEGIN
			SET @usarIDSede = @usarIDSedeActual;
			SELECT @usarIDCarrera = C.[id]
			FROM [dbo].[Carreras] C
			INNER JOIN [dbo].[Sedes] S
				ON S.[id] = C.[idSede]
			WHERE @IN_codigoCarreraNueva = LTRIM(RTRIM(C.[codigo]))
			AND S.[id] = @usarIDSedeActual
		END;


		-- solo existe como S
		IF( (@IN_codigoCarreraNueva IS NOT NULL 
				OR LTRIM(RTRIM(@IN_codigoCarreraNueva)) != '') 
			AND (@IN_codigoSedeNueva IS NULL 
			   	OR LTRIM(RTRIM(@IN_codigoSedeNueva)) = '') )
		BEGIN
			SET @usarIDCarrera = @usarIDCarreraActual;
			SELECT @usarIDSede = S.[id] 
			FROM [dbo].[Carreras] C
			INNER JOIN [dbo].[Sedes] S
				ON S.[id] = C.[idSede]
			WHERE C.[id] = @usarIDCarreraActual
			AND @IN_codigoSedeNueva = LTRIM(RTRIM(S.[codigo]))
		END;

		-- ambos existen
		IF( (@IN_codigoCarreraNueva IS NOT NULL 
				AND LTRIM(RTRIM(@IN_codigoCarreraNueva)) <> '') 
			AND (@IN_codigoSedeNueva IS NOT NULL 
			   	AND LTRIM(RTRIM(@IN_codigoSedeNueva)) <> '') )
		BEGIN
			SELECT @usarIDCarrera = C.[id],
			       @usarIDSede = S.[id] 
			FROM [dbo].[Carreras] C
			INNER JOIN [dbo].[Sedes] S
				ON S.[id] = C.[idSede]
			WHERE @IN_codigoCarreraNueva = LTRIM(RTRIM(C.[codigo]))
			AND @IN_codigoSedeNueva = LTRIM(RTRIM(S.[codigo]))
		END;

		IF (@usarIDSede IS NULL OR @usarIDCarrera IS NULL)
		BEGIN
			RAISERROR('el codigo sede y/o carrera no existe', 16, 1);
		END;



		-- INICIO DE LA TRANSACCI�N
		IF @@TRANCOUNT = 0
		BEGIN
		    SET @transaccionIniciada = 1;
		    BEGIN TRANSACTION;
		END;
			
			--actualizamos las asociaciones
			UPDATE A
			SET A.[idCarrera] = CASE WHEN (@usarIDCarrera IS NULL OR LTRIM(RTRIM(@usarIDCarrera)) = '') THEN A.[idCarrera]
									 ELSE @usarIDCarrera END,
				A.[nombre] = CASE WHEN (@IN_nombreNueva IS NULL OR LTRIM(RTRIM(@IN_nombreNueva)) = '') THEN A.[nombre]
									 ELSE @IN_nombreNueva  END,
				A.[descripcion] = CASE WHEN (@IN_descripcionNueva IS NULL OR LTRIM(RTRIM(@IN_descripcionNueva)) = '') THEN A.[descripcion]
									 ELSE @IN_descripcionNueva END,
				A.[telefono] = CASE WHEN (@IN_telefonoNueva IS NULL OR LTRIM(RTRIM(@IN_telefonoNueva)) = '') THEN A.[telefono]
									 ELSE @IN_telefonoNueva END
			FROM [dbo].[Asociaciones] A
			WHERE A.[idUsuario] = @usarIDUsuario
			AND A.[eliminado] = 0

			--actualizamos a el usuario
			UPDATE U
			SET U.[correo] = CASE WHEN (@IN_correoNueva IS NULL OR LTRIM(RTRIM(@IN_correoNueva)) = '') THEN U.[correo]
									 ELSE @IN_correoNueva END,
			    U.[clave] = CASE WHEN (@IN_claveNueva IS NULL OR LTRIM(RTRIM(@IN_claveNueva)) = '') THEN U.[clave]
									 ELSE @IN_claveNueva  END
			FROM [dbo].[Usuarios] U
			WHERE U.[id] = @usarIDUsuario
			AND U.[eliminado] = 0


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