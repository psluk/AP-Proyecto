--------------------------------------------------------------------------
-- Autor:       Luis Fernando Molina
-- Fecha:       2023-09-03
-- Descripci�n: agregamos una asociacion nueva
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Asociaciones_Agregar]
    -- Par�metros
    @IN_nombre VARCHAR(64),
	@IN_descripcion VARCHAR(256),
	@IN_telefono VARCHAR(16),
	@IN_codigoSede VARCHAR(4),
    @IN_codigoCarrera VARCHAR(4),
	@IN_correo VARCHAR(128),
	@IN_clave VARCHAR(64)
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACI�N DE VARIABLES
	DECLARE @usarTipoAsociacion VARCHAR(16) = 'Asocia%';
	DECLARE @usarIDtipoUsuario INT = 0;
	DECLARE @usarIDCarrera INT = NULL;
	DECLARE @usarIDSede INT = NULL;
	DECLARE @usarIDUsuario INT = NULL;

    BEGIN TRY

		-- VALIDACIONES
		IF (LTRIM(RTRIM(@IN_nombre)) = '')
        BEGIN
            RAISERROR('No se brindó un nombre', 16, 1)
        END;

		IF (LTRIM(RTRIM(@IN_descripcion)) = '')
        BEGIN
            RAISERROR('No se brindó una descripcion', 16, 1)
        END;

		IF (LTRIM(RTRIM(@IN_telefono)) = '')
        BEGIN
            RAISERROR('No se brindó un telefono', 16, 1)
        END;

		IF (LTRIM(RTRIM(@IN_codigoSede)) = '')
        BEGIN
            RAISERROR('No se brindó un código de sede', 16, 1)
        END;

		IF (LTRIM(RTRIM(@IN_codigoCarrera)) = '')
        BEGIN
            RAISERROR('No se brindó un código de carrera', 16, 1)
        END;

        IF (LTRIM(RTRIM(@IN_correo)) = '')
        BEGIN
            RAISERROR('No se brindó un correo electrónico', 16, 1)
        END;

        IF (LTRIM(RTRIM(@IN_clave)) = '')
        BEGIN
            RAISERROR('No se brindó una contraseña', 16, 1)
        END;
		--validacion del dominio del correo
        IF (LTRIM(RTRIM(@IN_correo)) NOT LIKE '%@itcr.ac.cr' AND LTRIM(RTRIM(@IN_correo)) NOT LIKE '%@estudiantec.cr' AND LTRIM(RTRIM(@IN_correo)) NOT LIKE '%@tec.ac.cr')
        BEGIN
            RAISERROR('El correo "%s" no pertenece al dominio @estudiantec.cr ni @itcr.ac.cr', 16, 1, @IN_correo);
        END;

		--validacion de que no exista el usuario
        IF EXISTS ( SELECT  1
                    FROM    [dbo].[Usuarios] U
                    WHERE   U.[correo] = LTRIM(RTRIM(@IN_correo))
                        AND U.[eliminado] = 0)
        BEGIN
            RAISERROR('Ya existe un usuario con el correo "%s"', 16, 1, @IN_correo)
        END;

		SELECT @usarIDCarrera = C.[id], @usarIDSede = S.[id]
		FROM [dbo].[Carreras] C
		INNER JOIN [dbo].[Sedes] S
			ON S.[id] = C.[idSede]
		WHERE C.[codigo] = LTRIM(RTRIM(@IN_codigoCarrera))
		AND S.[codigo] = LTRIM(RTRIM(@IN_codigoSede));

		IF ((@usarIDCarrera IS NULL) OR (@usarIDSede IS NULL))
		BEGIN
			RAISERROR('No se encontro la Sede "%s" o Carrera "%s" a la cual pertenecera la asociacion', 16, 1,@IN_codigoSede ,@IN_codigoCarrera)
		END;

        --validacion de que existe unicamente una asociacion
        IF EXISTS (SELECT 1 
                    FROM [dbo].[Asociaciones] A
                    INNER JOIN [dbo].[Carreras] C
                        ON A.[idCarrera] = C.[id]
		            INNER JOIN [dbo].[Sedes] S
		            	ON S.[id] = C.[idSede]
		            WHERE C.[id] = LTRIM(RTRIM(@usarIDCarrera))
		            AND S.[id] = LTRIM(RTRIM(@usarIDSede))
                    AND A.[eliminado] = 0)

        BEGIN
			RAISERROR('Ya existe una asociación para esta carrera en esta sede', 16, 1)
		END;


		SELECT @usarIDtipoUsuario = Tu.[id]
		FROM [dbo].[TiposUsuario] Tu
		WHERE Tu.[nombre] LIKE @usarTipoAsociacion

		-- INICIO DE LA TRANSACCI�N
		IF @@TRANCOUNT = 0
		BEGIN
		    SET @transaccionIniciada = 1;
		    BEGIN TRANSACTION;
		END;
			--creamos al usuario
		    INSERT INTO [dbo].[Usuarios](
				[idTipoUsuario], 
				[correo], 
				[clave], 
				[eliminado]
			)
			VALUES(@usarIDtipoUsuario,
					LTRIM(RTRIM(@IN_correo)),
					LTRIM(RTRIM(@IN_clave)),
					0);

			SET @usarIDUsuario = SCOPE_IDENTITY();

			--creamos a la asociacion
			INSERT INTO [dbo].[Asociaciones](
				[idCarrera], 
				[idUsuario], 
				[nombre], 
				[descripcion], 
				[telefono], 
				[eliminado]
			)
			VALUES(@usarIDCarrera,
					@usarIDUsuario,
					LTRIM(RTRIM(@IN_nombre)),
					LTRIM(RTRIM(@IN_descripcion)),
					@IN_telefono,
					0)


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