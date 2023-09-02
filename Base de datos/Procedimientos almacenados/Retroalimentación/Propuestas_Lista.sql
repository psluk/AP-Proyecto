--------------------------------------------------------------------------
-- Autor:       Paúl Rodríguez García
-- Fecha:       2023-09-02
-- Descripción: Devuelve la lista de propuestas.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Propuestas_Lista]
    -- Parámetros
    @IN_titulo          VARCHAR(64) = NULL,
    @IN_carnet          INT = NULL,
    @IN_codigoCarrera   VARCHAR(4) = NULL,
    @IN_codigoSede      VARCHAR(4) = NULL,
    @IN_descripcion     VARCHAR(32) = NULL,
    @IN_fechaInicio     DATETIME = NULL,
    @IN_fechaFin        DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
    DECLARE @usarFiltroDeTitulo BIT = 0;
    DECLARE @usarFiltroDeCarnet BIT = 0;
    DECLARE @usarFiltroDeCarrera BIT = 0;
    DECLARE @usarFiltroDeSede BIT = 0;
    DECLARE @usarFiltroDeEstado BIT = 0;
    DECLARE @usarFiltroDeFechaInicio BIT = 0;
    DECLARE @usarFiltroDeFechaFin BIT = 0;

    BEGIN TRY

        -- VALIDACIONES
        IF (@IN_titulo IS NOT NULL) AND (LTRIM(RTRIM(@IN_titulo)) <> '')
        BEGIN
            SET @usarFiltroDeTitulo = 1;
        END;

        IF @IN_carnet IS NOT NULL
        BEGIN
            SET @usarFiltroDeCarnet = 1;
        END;

        IF (@IN_codigoCarrera IS NOT NULL) AND (LTRIM(RTRIM(@IN_codigoCarrera)) <> '')
        BEGIN
            SET @usarFiltroDeCarrera = 1;
        END;

        IF (@IN_codigoSede IS NOT NULL) AND (LTRIM(RTRIM(@IN_codigoSede)) <> '')
        BEGIN
            SET @usarFiltroDeSede = 1;
        END;

        IF (@IN_descripcion IS NOT NULL) AND (LTRIM(RTRIM(@IN_descripcion)) <> '')
        BEGIN
            SET @usarFiltroDeEstado = 1;
        END;

        IF @IN_fechaInicio IS NOT NULL
        BEGIN
            SET @usarFiltroDeFechaInicio = 1;
        END;

        IF @IN_fechaFin IS NOT NULL
        BEGIN
            SET @usarFiltroDeFechaFin = 1;
        END;

        -- Se retorna la información
        SELECT COALESCE(
            (SELECT P.[uuid]            AS  'id',
                    P.[titulo]          AS  'titulo',
                    P.[tematica]        AS  'tematica',
                    CASE 
                        WHEN LEN(P.[objetivos]) <= 50 THEN P.[objetivos]
                        ELSE LEFT(P.[objetivos], 47) + '…'
                    END                 AS  'objetivos',
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
            WHERE   (
                        @usarFiltroDeTitulo = 0
                    OR  P.[titulo]
                        COLLATE Latin1_General_CI_AI        -- Para omitir tildes
                        LIKE '%' + @IN_titulo + '%'
                ) AND (
                        @usarFiltroDeCarnet = 0
                    OR  E.[carnet] = @IN_carnet
                ) AND (
                        @usarFiltroDeCarrera = 0
                    OR  C.[codigo] = @IN_codigoCarrera
                ) AND (
                        @usarFiltroDeSede = 0
                    OR  S.[codigo] = @IN_codigoSede
                ) AND (
                        @usarFiltroDeEstado = 0
                    OR  EdP.[descripcion] = @IN_descripcion
                ) AND (
                        @usarFiltroDeFechaInicio = 0
                    OR  P.[timestamp] >= @IN_fechaInicio
                ) AND (
                        @usarFiltroDeFechaFin = 0
                    OR  P.[timestamp] <= @IN_fechaFin
                ) AND P.[eliminado] = 0
            ORDER BY P.[timestamp] ASC
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