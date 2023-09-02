--------------------------------------------------------------------------
-- Autor:       Paúl Rodríguez García
-- Fecha:       2023-08-30
-- Descripción: Elimina un estudiante determinado.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Estudiantes_Eliminar]
    -- Parámetros
    @IN_carnet  INT
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;
    DECLARE @idEstudiante INT = NULL;

    BEGIN TRY

        SELECT  @idEstudiante = E.[id]
        FROM    [dbo].[Estudiantes] E
        WHERE   E.[eliminado] = 0
            AND E.[carnet] = @IN_carnet;

        -- VALIDACIONES
        IF @idEstudiante IS NULL
        BEGIN
            RAISERROR('No existe ningún estudiante con el carné %d.', 16, 1, @IN_carnet)
        END;

        -- INICIO DE LA TRANSACCIÓN
        IF @@TRANCOUNT = 0
        BEGIN
            SET @transaccionIniciada = 1;
            BEGIN TRANSACTION;
        END;

            -- Se elimina el usuario
            UPDATE  U
            SET     U.[eliminado] = 1
            FROM    [dbo].[Usuarios] U
            INNER JOIN  [dbo].[Estudiantes] E
                ON  E.[idUsuario] = U.[id]
            WHERE   U.[eliminado] = 0
                AND E.[eliminado] = 0
                AND E.[id] = @idEstudiante;

            -- Se elimina el estudiante
            UPDATE  E
            SET     E.[eliminado] = 1
            FROM    [dbo].[Estudiantes] E
            WHERE   E.[id] = @idEstudiante
                AND E.[eliminado] = 0;

            -- Se elimina como colaborador
            UPDATE  CdE
            SET     CdE.[eliminado] = 1
            FROM    [dbo].[ColaboradoresDeEvento] CdE
            INNER JOIN  [dbo].[Estudiantes] E
                ON  CdE.[idEstudiante] = E.[id]
            WHERE   E.[id] = @idEstudiante
                AND CdE.[eliminado] = 0;

            -- Se eliminan las solicitudes de colaboración
            UPDATE  S
            SET     S.[eliminado] = 1
            FROM    [dbo].[Solicitudes] S
            INNER JOIN  [dbo].[Estudiantes] E
                ON  S.[idEstudiante] = E.[id]
            WHERE   E.[id] = @idEstudiante
                AND S.[eliminado] = 0;

            -- Se eliminan las membresías
            UPDATE  EdA
            SET     EdA.[eliminado] = 1
            FROM    [dbo].[EstudiantesDeAsociacion] EdA
            INNER JOIN  [dbo].[Estudiantes] E
                ON  EdA.[idEstudiante] = E.[id]
            WHERE   E.[id] = @idEstudiante
                AND EdA.[eliminado] = 0;

            -- Se eliminan los eventos de interés
            UPDATE  EdI
            SET     EdI.[eliminado] = 1
            FROM    [dbo].[EventosDeInteres] EdI
            INNER JOIN  [dbo].[Estudiantes] E
                ON  EdI.[idEstudiante] = E.[id]
            WHERE   E.[id] = @idEstudiante
                AND EdI.[eliminado] = 0;

            -- Se eliminan las inscripciones
            UPDATE  I
            SET     I.[eliminado] = 1
            FROM    [dbo].[inscripciones] I
            INNER JOIN  [dbo].[Estudiantes] E
                ON  I.[idEstudiante] = E.[id]
            WHERE   E.[id] = @idEstudiante
                AND I.[eliminado] = 0;

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