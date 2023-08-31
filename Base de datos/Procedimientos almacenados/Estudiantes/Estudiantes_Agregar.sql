--------------------------------------------------------------------------
-- Autor:       Paúl Rodríguez García
-- Fecha:       2023-08-30
-- Descripción: Crea un estudiante con los datos proporcionados.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Estudiantes_Agregar]
    -- Parámetros
    @IN_correo          VARCHAR(128),
    @IN_clave           VARCHAR(64),
    @IN_codigoCarrera   VARCHAR(4),
    @IN_codigoSede      VARCHAR(4),
    @IN_nombre          VARCHAR(32),
    @IN_apellido1       VARCHAR(16),
    @IN_apellido2       VARCHAR(16),
    @IN_carnet          INT
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
    DECLARE @DESCRIPCION_ESTUDIANTE VARCHAR(16) = 'Estudiante';
    DECLARE @idUsuario INT;
    DECLARE @idCarrera INT = NULL;
    DECLARE @idSede INT = NULL;

    BEGIN TRY

        -- VALIDACIONES
        IF EXISTS ( SELECT  1
                    FROM    [dbo].[Usuarios] U
                    WHERE   U.[correo] = @IN_correo
                        AND U.[eliminado] = 0 )
        BEGIN
            RAISERROR('Ya existe un usuario con el correo "%s".', 16, 1, @IN_correo)
        END;

        IF (@IN_correo NOT LIKE '%@estudiantec.cr')
        BEGIN
            RAISERROR('El correo "%s" no pertenece al dominio @estudiantec.cr.', 16, 1, @IN_correo);
        END;

        IF EXISTS ( SELECT  1
                    FROM    [dbo].[Estudiantes] E
                    WHERE   E.[carnet] = @IN_carnet
                        AND E.[eliminado] = 0 )
        BEGIN
            RAISERROR('Ya existe un estudiante con el carné %d.', 16, 1, @IN_carnet)
        END;

        SELECT  @idCarrera = C.[id]
        FROM    [dbo].[Carreras] C
        WHERE   C.[codigo] = @IN_codigoCarrera;

        IF @idCarrera IS NULL
        BEGIN
            RAISERROR('No existe ninguna carrera con el código "%s".', 16, 1, @IN_codigoCarrera)
        END;

        SELECT  @idSede = S.[id]
        FROM    [dbo].[Sedes] S
        WHERE   S.[codigo] = @IN_codigoSede;

        IF @idSede IS NULL
        BEGIN
            RAISERROR('No existe ninguna sede con el código "%s".', 16, 1, @IN_codigoSede)
        END;

        -- INICIO DE LA TRANSACCIÓN
        IF @@TRANCOUNT = 0
        BEGIN
            SET @transaccionIniciada = 1;
            BEGIN TRANSACTION;
        END;

        -- Se crea el usuario
        INSERT INTO [dbo].[Usuarios]
        (
            [idTipoUsuario],
            [correo],
            [clave],
            [eliminado]
        )
        SELECT  TOP 1
                TU.[id],
                @IN_correo,
                @IN_clave,
                0
        FROM    [dbo].[TiposUsuario] TU
        WHERE   TU.[nombre] = @DESCRIPCION_ESTUDIANTE;

        -- Se crea el estudiante
        SET @idUsuario = SCOPE_IDENTITY();

        INSERT INTO [dbo].[Estudiantes]
        (
            [idCarrera],
            [idSede],
            [idUsuario],
            [nombre],
            [apellido1],
            [apellido2],
            [carnet],
            [eliminado]
        )
        VALUES
        (
            @idCarrera,
            @idSede,
            @idUsuario,
            @IN_nombre,
            @IN_apellido1,
            @IN_apellido2,
            @IN_carnet,
            0
        );

        -- COMMIT DE LA TRANSACCIÓN
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