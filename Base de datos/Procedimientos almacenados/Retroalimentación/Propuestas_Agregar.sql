--------------------------------------------------------------------------
-- Autor:       Paúl Rodríguez García
-- Fecha:       2023-09-02
-- Descripción: Crea una propuesta para un evento.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Propuestas_Agregar]
    -- Parámetros
    @IN_carnet          INT,
    @IN_codigoCarrera   VARCHAR(4),
    @IN_codigoSede      VARCHAR(4),
    @IN_titulo          VARCHAR(64),
    @IN_tematica        VARCHAR(64),
    @IN_objetivos       VARCHAR(256),
    @IN_actividades     VARCHAR(512),
    @IN_otros           VARCHAR(512)
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
    DECLARE @DESCRIPCION_INICIAL VARCHAR(32) = 'Sin revisar';
    DECLARE @idEstudiante INT = NULL;
    DECLARE @idAsociacion INT = NULL;

    BEGIN TRY

        -- VALIDACIONES
        SELECT  @idEstudiante = E.[id]
        FROM    [dbo].[Estudiantes] E
        WHERE   E.[carnet] = @IN_carnet
            AND E.[eliminado] = 0;

        IF @idEstudiante IS NULL
        BEGIN
            RAISERROR('No existe ningún estudiante con el carné %d', 16, 1, @IN_carnet);
        END;

        SELECT  @idAsociacion = A.[id]
        FROM    [dbo].[Asociaciones] A
        INNER JOIN  [dbo].[Carreras] C
            ON  A.[idCarrera] = C.[id]
        INNER JOIN  [dbo].[Sedes] S
            ON  A.[idSede] = S.[id]
        WHERE   A.[eliminado] = 0
            AND C.[codigo] = @IN_codigoCarrera
            AND S.[codigo] = @IN_codigoSede;

        IF @idAsociacion IS NULL
        BEGIN
            RAISERROR('No existe la asociación', 16, 1);
        END;

        IF @IN_titulo = ''
        BEGIN
            RAISERROR('El título no puede estar vacío', 16, 1);
        END;

        IF @IN_tematica = ''
        BEGIN
            RAISERROR('La temática no puede estar vacía', 16, 1);
        END;

        IF @IN_objetivos = ''
        BEGIN
            RAISERROR('La lista de objetivos no puede estar vacía', 16, 1);
        END;

        IF @IN_actividades = ''
        BEGIN
            RAISERROR('La lista de actividades no puede estar vacía', 16, 1);
        END;

        -- INICIO DE LA TRANSACCIÓN
        IF @@TRANCOUNT = 0
        BEGIN
            SET @transaccionIniciada = 1;
            BEGIN TRANSACTION;
        END;

            INSERT INTO [dbo].[Propuestas]
            (
                [idEstudiante],
                [idAsociacion],
                [idEstado],
                [uuid],
                [titulo],
                [tematica],
                [objetivos],
                [actividades],
                [otros],
                [timestamp],
                [eliminado]
            )
            SELECT  @idEstudiante,
                    @idAsociacion,
                    EdP.[id],
                    NEWID(),
                    @IN_titulo,
                    @IN_tematica,
                    @IN_objetivos,
                    @IN_actividades,
                    @IN_otros,
                    GETUTCDATE(),
                    0
            FROM    [dbo].[EstadosDePropuesta] EdP
            WHERE   EdP.[descripcion] = @DESCRIPCION_INICIAL;

            -- Se retorna el nuevo UUID
            SELECT (
                SELECT  P.[uuid]  AS 'id'
                FROM    [dbo].[Propuestas] P
                WHERE   P.[id] = SCOPE_IDENTITY()
                FOR JSON PATH
            ) AS 'results';

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