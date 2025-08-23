using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using aqua.api.Entities;

namespace aqua.api.Repositories;

public class GenericRepository<T>(IDynamoDBContext context, ILogger<CondoRepository> logger) : IRepository<T> where T : IDynamoEntity
{
    private readonly IDynamoDBContext context = context;
    private readonly ILogger<CondoRepository> logger = logger;

    public async Task<bool> CreateAsync(Guid id, T entity, string? attribute)
    {
        try
        {
            entity.Id = id;
            // Condo.Attribute = attribute;
            await context.SaveAsync(entity);
            logger.LogInformation("{Entity} {Id} is added", nameof(T), entity.Id);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "fail to persist to DynamoDb Table");
            return false;
        }

        return true;
    }

    public async Task<bool> DeleteAsync(T entity)
    {
        bool result;
        try
        {
            // Delete the Condo.
            await context.DeleteAsync<T>(entity.Id);
            // Try to retrieve deleted Condo. It should return null.
            T deletedCondo = await context.LoadAsync<T>(entity.Id, new DynamoDBContextConfig
            {
                ConsistentRead = true
            });

            result = deletedCondo == null;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "fail to delete {Entity} from DynamoDb Table", nameof(T));
            result = false;
        }

        if (result) logger.LogInformation("{Entity} {Id} is deleted", entity, entity.Id);

        return result;
    }

    public async Task<bool> UpdateAsync(T stmt)
    {
        if (stmt == null) return false;

        try
        {
            await context.SaveAsync(stmt);
            logger.LogInformation("{Entity} {Id} is updated", nameof(T), stmt);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "fail to update {Entity} from DynamoDb Table", nameof(T));
            return false;
        }

        return true;
    }

    public async Task<IList<T>?> GetListAsync(Guid id, string attribute)
    {
        try
        {
            var result = new List<T>();
            var queryResult = context.FromQueryAsync<T>(new QueryOperationConfig()
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

            logger.LogInformation("Querying for {Entity} with Id: {id}", nameof(T), id);
            do
            {
                result.AddRange(await queryResult.GetNextSetAsync());
            }
            while (!queryResult.IsDone && result.Count < 100);

            logger.LogInformation("Done Querying for Condo with Id: {id}. Results: {result.Count}", id, result.Count);
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

    public async Task<T?> GetByIdAsync(Guid id, string? attribute)
    {
       try
        {
            // var result = new Condo();
            var queryResult = context.FromQueryAsync<T>(new QueryOperationConfig()
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
                        {":v_attr", attribute}
                    }
                }
            });

            logger.LogInformation("Querying for {Entity} with Id {Id}", nameof(T), id);
            
            var result = await queryResult.GetNextSetAsync();

            logger.LogInformation("Done Querying for {Entity} with Id: {id}. Results: {result.Count}", nameof(T), id, result.Count);
            return result.FirstOrDefault();

        }
        catch (Exception ex)
        {
            logger.LogError(ex, "fail to Get Condo from DynamoDb Table");
            return default;
        }
    }

}