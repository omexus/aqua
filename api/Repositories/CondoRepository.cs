using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using aqua.api.Entities;

namespace aqua.api.Repositories;

public class CondoRepository(IDynamoDBContext context, ILogger<CondoRepository> logger) : IRepository<Condo>
{
    private readonly IDynamoDBContext context = context;
    private readonly ILogger<CondoRepository> logger = logger;

    public async Task<bool> CreateAsync(Guid id, Condo entity, string? attribute)
    {
        try
        {
            entity.Id = id;
            // Condo.Attribute = attribute;
            await context.SaveAsync(entity);
            logger.LogInformation("{Condo} {Id} is added", nameof(Condo), entity.Id);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "fail to persist to DynamoDb Table");
            return false;
        }

        return true;
    }

    public async Task<bool> DeleteAsync(Condo Condo)
    {
        bool result;
        try
        {
            // Delete the Condo.
            await context.DeleteAsync<Condo>(Condo.Id);
            // Try to retrieve deleted Condo. It should return null.
            Condo deletedCondo = await context.LoadAsync<Condo>(Condo.Id, new DynamoDBContextConfig
            {
                ConsistentRead = true
            });

            result = deletedCondo == null;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "fail to delete Condo from DynamoDb Table");
            result = false;
        }

        if (result) logger.LogInformation("Condo {Id} is deleted", Condo);

        return result;
    }

    public async Task<bool> UpdateAsync(Condo stmt)
    {
        if (stmt == null) return false;

        try
        {
            await context.SaveAsync(stmt);
            logger.LogInformation("Condo {Id} is updated", stmt);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "fail to update Condo from DynamoDb Table");
            return false;
        }

        return true;
    }

    public async Task<IList<Condo>?> GetListAsync(Guid id, string attribute)
    {
        try
        {
            var result = new List<Condo>();
            var queryResult = context.FromQueryAsync<Condo>(new QueryOperationConfig()
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

            logger.LogInformation($"Querying for Condo with Id: {id}");
            do
            {
                result.AddRange(await queryResult.GetNextSetAsync());
            }
            while (!queryResult.IsDone && result.Count < 100);

            logger.LogInformation($"Done Querying for Condo with Id: {id}. Results: {result.Count}");
            return result;

        }
        catch (Exception ex)
        {
            logger.LogInformation($"exception occured while querying for Condo with Id: {id}: {ex}");
            logger.LogError(ex, "fail to Get Condo from DynamoDb Table");
            return null;
        }

        // return new List<Condo>();
    }

    public async Task<Condo?> GetByIdAsync(Guid id, string? attribute)
    {
       try
        {
            // var result = new Condo();
            var queryResult = context.FromQueryAsync<Condo>(new QueryOperationConfig()
            {
                // IndexName = "",
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
                        {":v_attr", "CONDO#"}
                    }
                }
            });

            logger.LogInformation("Querying for Condo with Id {Id}", id);
            
            var result = await queryResult.GetNextSetAsync();

            logger.LogInformation($"Done Querying for Condo with Id: {id}. Results: {result.Count}");
            return result.FirstOrDefault();

        }
        catch (Exception ex)
        {
            logger.LogError(ex, "fail to Get Condo from DynamoDb Table");
            return null;
        }

    }


    public async Task<Condo?> GetAsync(Guid id, string attribute)
    {
        try
        {
            return await context.LoadAsync<Condo>(id);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "fail to Get Condo from DynamoDb Table");
            return null;
        }
    }

}