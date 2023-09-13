--------------------------------------------------------------------------
-- Autor:       Paúl Rodríguez García
-- Fecha:       2023-08-30
-- Descripción: Modifica un estudiante según los datos proporcionados.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Estudiantes_Modificar]
    -- Parámetros
    @IN_carnet          INT,
    @IN_correo          VARCHAR(128),
    @IN_clave           VARCHAR(64) = NULL,
    @IN_codigoCarrera   VARCHAR(4),
    @IN_codigoSede      VARCHAR(4),
    @IN_nombre          VARCHAR(32),
    @IN_apellido1       VARCHAR(16),
    @IN_apellido2       VARCHAR(16),
    @IN_carnetNuevo     INT
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
    DECLARE @DESCRIPCION_ESTUDIANTE VARCHAR(16) = 'Estudiante';
    DECLARE @correoCambia BIT = 0;
    DECLARE @claveCambia BIT = 0;
    DECLARE @idCarrera INT = NULL;
    DECLARE @idSede INT = NULL;

    BEGIN TRY

        -- VALIDACIONES
        IF (LTRIM(RTRIM(@IN_correo)) = '')
        BEGIN
            RAISERROR('No se brindó un correo electrónico', 16, 1)
        END;

        IF (LTRIM(RTRIM(@IN_codigoCarrera)) = '')
        BEGIN
            RAISERROR('No se brindó un código de carrera', 16, 1)
        END;

        IF (LTRIM(RTRIM(@IN_codigoSede)) = '')
        BEGIN
            RAISERROR('No se brindó un código de sede', 16, 1)
        END;

        IF (LTRIM(RTRIM(@IN_nombre)) = '')
        BEGIN
            RAISERROR('No se brindó un nombre', 16, 1)
        END;

        IF (LTRIM(RTRIM(@IN_apellido1)) = '')
        BEGIN
            RAISERROR('No se brindó el primer apellido', 16, 1)
        END;

        IF (@IN_carnet = 0) OR (@IN_carnetNuevo = 0)
        BEGIN
            RAISERROR('No se brindó un carné', 16, 1)
        END;

        IF NOT EXISTS ( SELECT  1
                        FROM    [dbo].[Estudiantes] E
                        WHERE   E.[eliminado] = 0
                            AND E.[carnet] = @IN_carnet )
        BEGIN
            RAISERROR('No existe ningún estudiante con el carné %d.', 16, 1, @IN_carnet)
        END;

        IF EXISTS ( SELECT  1
                    FROM    [dbo].[Usuarios] U
                    INNER JOIN [dbo].[Estudiantes] E
                        ON  E.[idUsuario] = U.[id]
                    WHERE   U.[correo] != @IN_correo
                        AND U.[eliminado] = 0
                        AND E.[carnet] = @IN_carnet
                        AND E.[eliminado] = 0 )
        BEGIN
            SET @correoCambia = 1;

            IF EXISTS ( SELECT  1
                        FROM    [dbo].[Usuarios] U
                        LEFT JOIN [dbo].[Estudiantes] E
                            ON  E.[idUsuario] = U.[id]
                        WHERE   U.[correo] = @IN_correo
                            AND U.[eliminado] = 0
                            AND (
                                E.[carnet] IS NULL
                                OR (
                                    E.[carnet] != @IN_carnet
                                AND E.[eliminado] = 0
                                )
                            )
                        )
            BEGIN
                RAISERROR('Ya existe un usuario con el correo "%s".', 16, 1, @IN_correo)
            END;

            IF (@IN_correo NOT LIKE '%@estudiantec.cr')
            BEGIN
                RAISERROR('El correo "%s" no pertenece al dominio @estudiantec.cr.', 16, 1, @IN_correo);
            END;
        END;

        IF @IN_carnet != @IN_carnetNuevo
        BEGIN
            IF EXISTS ( SELECT  1
                        FROM    [dbo].[Estudiantes] E
                        WHERE   E.[carnet] = @IN_carnetNuevo
                            AND E.[eliminado] = 0 )
            BEGIN
                RAISERROR('Ya existe un estudiante con el carné %d.', 16, 1, @IN_carnetNuevo)
            END;
        END;

        SELECT  @idSede = S.[id]
        FROM    [dbo].[Sedes] S
        WHERE   S.[codigo] = @IN_codigoSede;

        IF @idSede IS NULL
        BEGIN
            RAISERROR('No existe ninguna sede con el código "%s".', 16, 1, @IN_codigoSede)
        END;

        SELECT  @idCarrera = C.[id]
        FROM    [dbo].[Carreras] C
        WHERE   C.[codigo] = @IN_codigoCarrera
            AND C.[idSede] = @idSede;

        IF @idCarrera IS NULL
        BEGIN
            RAISERROR('No existe ninguna carrera con el código "%s".', 16, 1, @IN_codigoCarrera)
        END;

        IF (@IN_clave IS NOT NULL) AND (@IN_clave <> '')
        BEGIN
            -- Sí cambia la contraseña
            SET @claveCambia = 1;
        END;

        -- INICIO DE LA TRANSACCIÓN
        IF @@TRANCOUNT = 0
        BEGIN
            SET @transaccionIniciada = 1;
            BEGIN TRANSACTION;
        END;

            -- Se actualiza el usuario
            IF (@correoCambia = 1) OR (@claveCambia = 1)
            BEGIN
                UPDATE  U
                SET     U.[correo] = @IN_correo,
                        U.[clave] = CASE @claveCambia WHEN 1 THEN @IN_clave ELSE U.[clave] END
                FROM    [dbo].[Usuarios] U
                INNER JOIN [dbo].[Estudiantes] E
                    ON  E.[idUsuario] = U.[id]
                WHERE   U.[eliminado] = 0
                    AND E.[eliminado] = 0
                    AND E.[carnet] = @IN_carnet;
            END;

            -- Se actualiza el estudiante
            UPDATE  E
            SET     E.[idCarrera] = @idCarrera,
                    E.[nombre] = @IN_nombre,
                    E.[apellido1] = @IN_apellido1,
                    E.[apellido2] = @IN_apellido2,
                    E.[carnet] = @IN_carnetNuevo
            FROM    [dbo].[Estudiantes] E
            WHERE   E.[carnet] = @IN_carnet
                AND E.[eliminado] = 0;

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