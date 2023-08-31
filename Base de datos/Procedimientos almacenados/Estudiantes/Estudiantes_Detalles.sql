--------------------------------------------------------------------------
-- Autor:       Paúl Rodríguez García
-- Fecha:       2023-08-30
-- Descripción: Retorna los detalles de un estudiante.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Estudiantes_Detalles]
    -- Parámetros
    @IN_carnet INT
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
    DECLARE @idEstudiante BIT = 0;

    BEGIN TRY

        -- Validaciones
        IF NOT EXISTS ( SELECT  1
                        FROM    [dbo].[Estudiantes] E
                        WHERE   E.[carnet] = @IN_carnet
                            AND E.[eliminado] = 0 )
        BEGIN
            RAISERROR('No existe ningún estudiante con el carné %d.', 16, 1, @IN_carnet);
        END;

        SELECT  E.[carnet]      AS 'carnet',
                E.[nombre]      AS 'nombre',
                E.[apellido1]   AS 'apellido1',
                E.[apellido2]   AS 'apellido2',
                U.[correo]      AS 'correo',
                C.[codigo]      AS 'carrera.codigo', 
                C.[nombre]      AS 'carrera.nombre',
                S.[codigo]      AS 'sede.codigo',
                S.[nombre]      AS 'sede.nombre'
        FROM    [dbo].[Estudiantes] E
        INNER JOIN  [dbo].[Carreras] C
            ON  E.[idCarrera] = C.[id]
        INNER JOIN  [dbo].[Sedes] S
            ON  E.[idSede] = S.[id]
        INNER JOIN [dbo].[Usuarios] U
            ON  E.[idUsuario] = U.[id]
        WHERE   E.[eliminado] = 0
            AND @IN_carnet IS NOT NULL
            AND E.[carnet] = @IN_carnet
        FOR JSON PATH;

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