--------------------------------------------------------------------------
-- Autor:       Fabián Vargas
-- Fecha:       23-09-02
-- Descripción: Retorna los detalles de un evento
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[AsociaTEC_SP_Eventos_Detalles]
    @IN_uuid UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;         -- No retorna metadatos

    -- CONTROL DE ERRORES
    DECLARE @ErrorNumber INT, @ErrorSeverity INT, @ErrorState INT, @Message VARCHAR(200);
    DECLARE @transaccion_iniciada BIT = 0;

    -- DECLARACIÓN DE VARIABLES
    DECLARE @IdEvento INT = NULL
    DECLARE @PuedeIns BIT = 1

    BEGIN TRY

        SELECT @IdEvento = E.id
        FROM Eventos E
        WHERE E.uuid = @IN_uuid
        AND E.eliminado = 0

        IF NOT EXISTS
        ( 
            SELECT 1 
            FROM [dbo].[Eventos] E 
            WHERE E.[uuid] = @IN_uuid
            AND e.[eliminado] = 0
        )
        BEGIN
            DECLARE @uuid_varchar VARCHAR(36)= (SELECT CONVERT(NVARCHAR(36), @IN_uuid))
            RAISERROR('No existe ningún evento con el uuid %s.', 16, 1, @uuid_varchar)
        END

        IF (SELECT  COUNT(I.[id])
            FROM    [dbo].[Inscripciones] I
            WHERE   I.[idEvento] = @idEvento
                AND I.[eliminado] = 0 )
            >=
            ISNULL((SELECT  E.[capacidad]
            FROM    [dbo].[Eventos] E
            WHERE   E.[id] = @idEvento
                AND E.[eliminado] = 0
                AND GETUTCDATE() < E.[fechaFin] ), 0)
        BEGIN
            SELECT @PuedeIns = 0
        END;

        SELECT COALESCE(
            (
                SELECT 
                    E.[titulo],
                    E.[descripcion],
                    E.[capacidad],
                    E.[fechaInicio],
                    E.[fechaFin],
                    E.[lugar],
                    E.[especiales],
                    C.[nombre] as 'categoria',
                    A.[nombre] as 'asociacion',
                    @PuedeIns as 'puedeInscribirse'
                FROM [dbo].[Eventos] E
                INNER JOIN [dbo].[Categorias] C
                ON C.[id] = E.[idCategoria]
                INNER JOIN [dbo].[Asociaciones] A
                ON A.[id] = E.[idAsociacion]
                WHERE E.[uuid] = @IN_uuid
                AND E.[eliminado] = 0
                FOR JSON PATH      
            ),
            '[]'
        ) as 'results'
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