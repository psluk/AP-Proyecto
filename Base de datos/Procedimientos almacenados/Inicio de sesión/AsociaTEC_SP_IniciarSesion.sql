--------------------------------------------------------------------------
-- Autor:       Fabián Vargas
-- Fecha:       23-08-30
-- Descripción: Retorna los datos necesarios para verificar el intento de inicio de sesión
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_IniciarSesion]
    @IN_Correo VARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccion_iniciada BIT = 0;

    BEGIN TRY

        SELECT  U.[clave],
                U.[correo],
                TU.[nombre] AS 'tipoUsuario',
                C.[codigo] AS 'codigoCarrera',
                S.[codigo] AS 'codigoSede',
                E.[carnet]
        FROM [dbo].[Usuarios] U
        INNER JOIN  [dbo].[TiposUsuario] TU
            ON U.[idTipoUsuario] = TU.[id]
        LEFT JOIN Estudiantes E
            ON U.[id] = E.[idUsuario]
        LEFT JOIN Asociaciones A
            ON U.[id] = A.[idUsuario]
        LEFT JOIN Carreras C
            ON E.[idCarrera] = C.[id]
            OR A.[idCarrera] = C.[id]
        LEFT JOIN Sedes S
            ON C.[idSede] = S.[id]
        WHERE U.[correo] = @IN_correo
            AND (
                E.[eliminado] = 0
                OR E.[eliminado] IS NULL
            )

    END TRY
    BEGIN CATCH

        SET @ErrorNumber = ERROR_NUMBER();
        SET @ErrorSeverity = ERROR_SEVERITY();
        SET @ErrorState = ERROR_STATE();
        SET @Message = ERROR_MESSAGE();

        IF @transaccion_iniciada = 1
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