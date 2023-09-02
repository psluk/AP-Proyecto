--------------------------------------------------------------------------
-- Autor:       Paúl Rodríguez García
-- Fecha:       2023-08-29
-- Descripción: Retorna la lista de los estudiantes según los criterios
--              de búsqueda.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Estudiantes_Lista]
    -- Parámetros
    @IN_nombre VARCHAR(64) = NULL,
    @IN_carnet INT = NULL,
    @IN_codigoCarrera VARCHAR(4) = NULL,
    @IN_codigoSede VARCHAR(4) = NULL
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccionIniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
    DECLARE @usarFiltroDeNombre BIT = 0;
    DECLARE @usarFiltroDeCarnet BIT = 0;
    DECLARE @usarFiltroDeCarrera BIT = 0;
    DECLARE @usarFiltroDeSede BIT = 0;

    BEGIN TRY

        -- VALIDACIONES
        IF (@IN_nombre IS NOT NULL) AND (LTRIM(RTRIM(@IN_nombre)) <> '')
        BEGIN
            -- Filtro de nombre no vacío
            SET @usarFiltroDeNombre = 1;
        END;

        IF (@IN_carnet IS NOT NULL) AND @IN_carnet <> 0
        BEGIN
            -- Filtro de carné no vacío
            SET @usarFiltroDeCarnet = 1;
        END;

        IF (@IN_codigoCarrera IS NOT NULL) AND (LTRIM(RTRIM(@IN_codigoCarrera)) <> '')
        BEGIN
            -- Filtro de carrera no vacío
            SET @usarFiltroDeCarrera = 1;
        END;

        IF (@IN_codigoSede IS NOT NULL) AND (LTRIM(RTRIM(@IN_codigoSede)) <> '')
        BEGIN
            -- Filtro de sede no vacío
            SET @usarFiltroDeSede = 1;
        END;

        SELECT COALESCE(
            (SELECT E.[carnet]      AS 'carnet',
                    E.[nombre]      AS 'nombre',
                    E.[apellido1]   AS 'apellido1',
                    E.[apellido2]   AS 'apellido2',
                    C.[codigo]      AS 'carrera.codigo', 
                    C.[nombre]      AS 'carrera.nombre',
                    S.[codigo]      AS 'sede.codigo',
                    S.[nombre]      AS 'sede.nombre'
            FROM    [dbo].[Estudiantes] E
            INNER JOIN  [dbo].[Carreras] C
                ON  E.[idCarrera] = C.[id]
            INNER JOIN  [dbo].[Sedes] S
                ON  E.[idSede] = S.[id]
            WHERE   (
                        @usarFiltroDeNombre = 0
                    OR  CONCAT(E.[nombre], ' ', E.[apellido1], ' ', ISNULL(E.[apellido2], ''))
                        COLLATE Latin1_General_CI_AI        -- Para omitir tildes
                        LIKE '%' + @IN_nombre + '%'
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
                        E.[eliminado] = 0
                )
            ORDER BY E.[apellido1], E.[apellido2], E.[nombre] ASC
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