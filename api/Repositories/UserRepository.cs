using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using aqua.api.Entities;

namespace aqua.api.Repositories;

public class UserRepository(IDynamoDBContext context, ILogger<UserRepository> logger) : IUserRepository
{
    private readonly IDynamoDBContext context = context;
    private readonly ILogger<UserRepository> logger = logger;

    public async Task<bool> CreateAsync(Guid id, User User, string? attribute)
    {
        try
        {
            User.Id = id;
            // User.Attribute = attribute;
            await context.SaveAsync(User);
            logger.LogInformation("User {} is added", User.Id);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "fail to persist to DynamoDb Table");
            return false;
        }

        return true;
    }

    public async Task<bool> DeleteAsync(User User)
    {
        bool result;
        try
        {
            // Delete the User.
            await context.DeleteAsync<User>(User.Id);
            // Try to retrieve deleted User. It should return null.
            User deletedUser = await context.LoadAsync<User>(User.Id, new DynamoDBContextConfig
            {
                ConsistentRead = true
            });

            result = deletedUser == null;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "fail to delete User from DynamoDb Table");
            result = false;
        }

        if (result) logger.LogInformation("User {Id} is deleted", User);

        return result;
    }

    public async Task<bool> UpdateAsync(User stmt)
    {
        if (stmt == null) return false;

        try
        {
            await context.SaveAsync(stmt);
            logger.LogInformation("User {Id} is updated", stmt);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "fail to update User from DynamoDb Table");
            return false;
        }

        return true;
    }

    public async Task<IList<User>?> GetListAsync(Guid id, string attribute)
    {
        try
        {
            var result = new List<User>();
            var queryResult = context.FromQueryAsync<User>(new QueryOperationConfig()
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

            logger.LogInformation($"Querying for User with Id: {id}");
            do
            {
                result.AddRange(await queryResult.GetNextSetAsync());
            }
            while (!queryResult.IsDone && result.Count < 100);

            logger.LogInformation($"Done Querying for User with Id: {id}. Results: {result.Count}");
            return result;

        }
        catch (Exception ex)
        {
            logger.LogInformation($"exception occured while querying for User with Id: {id}: {ex}");
            logger.LogError(ex, "fail to Get User from DynamoDb Table");
            return null;
        }

        // return new List<User>();
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        try
        {
            return await context.LoadAsync<User>(id);
        }
        catch (Exception ex)
        {
            logger.Log(LogLevel.Error, ex.ToString());
            logger.LogError(ex, "fail to Get User from DynamoDb Table");
            return null;
        }
    }


    public async Task<User?> GetAsync(Guid id, string attribute)
    {
        try
        {
            return await context.LoadAsync<User>(id);
        }
        catch (Exception ex)
        {
            logger.Log(LogLevel.Error, ex.ToString());
            logger.LogError(ex, "fail to Get User from DynamoDb Table");
            return null;
        }
    }
}