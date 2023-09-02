--------------------------------------------------------------------------
-- Autor:       Paúl Rodríguez García
-- Fecha:       2023-09-02
-- Descripción: Devuelve los detalles de una propuesta.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Propuestas_Detalles]
    -- Parámetros
    @IN_propuesta       VARCHAR(36)
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
    DECLARE @uuidPropuesta UNIQUEIDENTIFIER = NULL;
    DECLARE @idPropuesta INT = NULL;

    BEGIN TRY

        -- VALIDACIONES
        SET @uuidPropuesta = TRY_CAST(@IN_propuesta AS UNIQUEIDENTIFIER);

        IF @uuidPropuesta IS NULL
        BEGIN
            RAISERROR('El identificador "%s" no es válido', 16, 1, @IN_propuesta);
        END;

        SELECT  @idPropuesta = P.[id]
        FROM    [dbo].[Propuestas] P
        WHERE   P.[uuid] = @uuidPropuesta
            AND P.[eliminado] = 0;

        IF @idPropuesta IS NULL
        BEGIN
            RAISERROR('No existe ninguna propuesta con el identificador "%s"', 16, 1, @IN_propuesta);
        END;

        -- Se retorna la información
        SELECT COALESCE(
            (SELECT P.[uuid]            AS  'id',
                    P.[titulo]          AS  'titulo',
                    P.[tematica]        AS  'tematica',
                    P.[objetivos]       AS  'objetivos',
                    P.[actividades]     AS  'actividades',
                    P.[otros]           AS  'otros',
                    P.[timestamp]       AS  'fecha',
                    EdP.[descripcion]   AS  'estado',
                    E.[carnet]          AS  'estudiante.carnet',
                    E.[nombre]          AS  'estudiante.nombre',
                    E.[apellido1]       AS  'estudiante.apellido1',
                    E.[apellido2]       AS  'estudiante.apellido2',
                    A.[nombre]          AS  'asociacion.nombre',
                    C.[codigo]          AS  'asociacion.carrera',
                    S.[codigo]          AS  'asociacion.sede'
            FROM    [dbo].[Propuestas] P
            INNER JOIN  [dbo].[EstadosDePropuesta] EdP
                ON  P.[idEstado] = EdP.[id]
            INNER JOIN  [dbo].[Estudiantes] E
                ON  P.[idEstudiante] = E.[id]
            INNER JOIN  [dbo].[Asociaciones] A
                ON  P.[idAsociacion] = A.[id]
            INNER JOIN  [dbo].[Carreras] C
                ON  A.[idCarrera] = C.[id]
            INNER JOIN  [dbo].[Sedes] S
                ON  A.[idSede] = S.[id]
            WHERE   P.[id] = @idPropuesta
            FOR JSON PATH),
            '[]'    -- Por defecto, si no hay resultados, no retorna nada, entonces esto hace
                    -- que el JSON retornado sea un arreglo vacío
        ) AS 'results';

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