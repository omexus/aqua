using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using aqua.api.Entities;

namespace aqua.api.Repositories;

public class DwellUnitRepository(IDynamoDBContext context, ILogger<DwellUnitRepository> logger) : IUnitRepository
{
    private readonly IDynamoDBContext context = context;
    private readonly ILogger<DwellUnitRepository> logger = logger;

    public async Task<bool> CreateAsync(Guid id, DwellUnit DwellUnit, string? attribute)
    {
        try
        {
            DwellUnit.Id = id;
            // DwellUnit.Attribute = attribute;
            await context.SaveAsync(DwellUnit);
            logger.LogInformation("DwellUnit {} is added", DwellUnit.Id);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "fail to persist to DynamoDb Table");
            return false;
        }

        return true;
    }

    public async Task<bool> DeleteAsync(DwellUnit DwellUnit)
    {
        bool result;
        try
        {
            // Delete the DwellUnit.
            await context.DeleteAsync<DwellUnit>(DwellUnit.Id);
            // Try to retrieve deleted DwellUnit. It should return null.
            DwellUnit deletedDwellUnit = await context.LoadAsync<DwellUnit>(DwellUnit.Id, new DynamoDBContextConfig
            {
                ConsistentRead = true
            });

            result = deletedDwellUnit == null;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "fail to delete DwellUnit from DynamoDb Table");
            result = false;
        }

        if (result) logger.LogInformation("DwellUnit {Id} is deleted", DwellUnit);

        return result;
    }

    public async Task<bool> UpdateAsync(DwellUnit stmt)
    {
        if (stmt == null) return false;

        try
        {
            await context.SaveAsync(stmt);
            logger.LogInformation("DwellUnit {Id} is updated", stmt);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "fail to update DwellUnit from DynamoDb Table");
            return false;
        }

        return true;
    }

    public async Task<IList<DwellUnit>?> GetListAsync(Guid id, string attribute)
    {
        try
        {
            var result = new List<DwellUnit>();
            var queryResult = context.FromQueryAsync<DwellUnit>(new QueryOperationConfig()
            {
                // IndexName = "Id-index",
                KeyExpression = new Expression
                {
                    ExpressionStatement = "Id = :v_Id and begins_with (#attr,:v_attr)",
                    ExpressionAttributeNames = new Dictionary<string, string>
                    {
                        {"#attr", "Attribute"}
                    },
                    ExpressionAttributeValues = new Dictionary<string, DynamoDBEntry>
                    {
                        {":v_Id", id},
                        {":v_attr", attribute}
                    }
                }
            });

            logger.LogInformation($"Querying for DwellUnit with Id: {id}");
            do
            {
                result.AddRange(await queryResult.GetNextSetAsync());
            }
            while (!queryResult.IsDone && result.Count < 100);

            logger.LogInformation($"Done Querying for DwellUnit with Id: {id}. Results: {result.Count}");
            return result;

        }
        catch (Exception ex)
        {
            logger.LogInformation($"exception occured while querying for DwellUnit with Id: {id}: {ex}");
            logger.LogError(ex, "fail to Get DwellUnit from DynamoDb Table");
            return null;
        }
    }

    public async Task<DwellUnit?> GetByIdAsync(Guid id, string unitId)
    {
       try
        {
            // var result = new DwellUnit();
            var queryResult = context.FromQueryAsync<DwellUnit>(new QueryOperationConfig()
            {
                IndexName = "GSI_Units",
                KeyExpression = new Expression
                {
                    ExpressionStatement = "Id = :v_Id and UnitId = :v_attr",
                    ExpressionAttributeValues = new Dictionary<string, DynamoDBEntry>
                    {
                        {":v_Id", id},
                        {":v_attr", unitId}
                    }
                }
            });

            logger.LogInformation("Querying for DwellUnit with Id {Id}", id);
            
            var result = await queryResult.GetNextSetAsync();

            logger.LogInformation($"Done Querying for DwellUnit with Id: {id}. Results: {result.Count}");
            return result.FirstOrDefault();

        }
        catch (Exception ex)
        {
            logger.LogInformation($"exception occured while querying for DwellUnit with Id: {id}: {ex}");
            logger.LogError(ex, "fail to Get DwellUnit from DynamoDb Table");
            return null;
        }

    }


    public async Task<DwellUnit?> GetAsync(Guid id, string attribute)
    {
        try
        {
            return await context.LoadAsync<DwellUnit>(id);
        }
        catch (Exception ex)
        {
            logger.Log(LogLevel.Error, ex.ToString());
            logger.LogError(ex, "fail to Get DwellUnit from DynamoDb Table");
            return null;
        }
    }
}