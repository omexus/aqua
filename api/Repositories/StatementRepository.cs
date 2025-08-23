using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using Amazon.DynamoDBv2.Model;
using aqua.api.Entities;
using Microsoft.Extensions.Logging;

namespace aqua.api.Repositories;

public class StatementRepository : IStatementRepository
{
    private readonly IDynamoDBContext context;
    private readonly ILogger<StatementRepository> logger;

    public StatementRepository(IDynamoDBContext context, ILogger<StatementRepository> logger)
    {
        this.context = context;
        this.logger = logger;
    }

    public async Task<bool> CreateAsync(Guid id, Statement statement, string? attribute)
    {
        try
        {
            statement.Id = id;
            // statement.Attribute = attribute;
            await context.SaveAsync(statement);
            logger.LogInformation("Statement {} is added", statement.Id);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "fail to persist to DynamoDb Table");
            return false;
        }

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, string rangeKey)
    {
        bool result;
        try
        {
            var stmts = await GetStatementsAsync(id, rangeKey);

            if (stmts == null || stmts.Count == 0)
            {
                logger.LogInformation("Statement {Id} is not found", id);
                return false;
            }

            var sampleStmt = stmts[0];

            var stmtBatch = context.CreateBatchWrite < Statement > ();
            stmtBatch.AddDeleteItems(stmts);
            await stmtBatch.ExecuteAsync();
// Specify the employee to delete
// stmtBatch.AddDeleteKey(id, rangeKey);

            // Delete the Statement.
            // var deleteItemRequest = new DeleteItemOperationConfig
            // {
            //     ConditionalExpression = new Expression
            //     {
            //         ExpressionStatement
            //             = "attribute_exists(Id) and Id =: v_id and begins_with (#attr,:v_attr)",
            //         ExpressionAttributeNames = new Dictionary<string, string>
            //         {
            //             {"#attr", "Attribute"}
            //         },
            //         ExpressionAttributeValues = new Dictionary<string, DynamoDBEntry>
            //         {
            //             {":v_id", id},
            //             {":v_attr", rangeKey}
            //         }
            //     }
            // };

            // var deleteItemRequest = new DeleteItemRequest
            // {
            //     TableName = "Statements",
            //     ConditionExpression = "Id = :v_id and and begins_with (#attr,:v_attr)",
            //     ExpressionAttributeNames = new Dictionary<string, string>
            //     {
            //         {"#attr", "Attribute"}
            //     },
            //     ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            //     {
            //         {":v_id", new AttributeValue {S = id.ToString()}},
            //         {":v_attr", new AttributeValue {S = rangeKey}}
            //     },
            //     Key = new Dictionary<string, AttributeValue>
            //     {
            //         {"Id", new AttributeValue {S = id.ToString()}},
            //         {"Attribute", new AttributeValue {S = rangeKey}}
            //     }
            // };

            // await context.DeleteAsync<Statement>(deleteItemRequest);
            
            // await context.DeleteAsync<Statement>(id, rangeKey);
            // Try to retrieve deleted Statement. It should return null.
            Statement deletedStatement = await context.LoadAsync<Statement>(id, sampleStmt.Attribute, new DynamoDBOperationConfig
            {
                ConsistentRead = true
            });

            result = deletedStatement == null;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "fail to delete Statement from DynamoDb Table");
            result = false;
        }

        if (result) logger.LogInformation("Statement {Id} is deleted", id);

        return result;
    }

    public async Task<bool> UpdateAsync(Statement stmt)
    {
        if (stmt == null) return false;

        try
        {
            await context.SaveAsync(stmt);
            logger.LogInformation("Statement {Id} is updated", stmt);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "fail to update statement from DynamoDb Table");
            return false;
        }

        return true;
    }

    public async Task<IList<Statement>?> GetStatementsAsync(Guid id, string attribute)
    {
        try
        {
            var result = new List<Statement>();
            var queryResult = context.FromQueryAsync<Statement>(new QueryOperationConfig()
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

            logger.LogInformation($"Querying for Statement with Id: {id}");
            do
            {
                result.AddRange(await queryResult.GetNextSetAsync());
            }
            while (!queryResult.IsDone && result.Count < 100);

            logger.LogInformation($"Done Querying for Statement with Id: {id}. Results: {result.Count}");
            return result;

        }
        catch (Exception ex)
        {
            logger.LogInformation($"exception occured while querying for Statement with Id: {id}: {ex}");
            logger.LogError(ex, "fail to Get Statement from DynamoDb Table");
            return null;
        }

        // return new List<Statement>();
    }

    public async Task<Statement?> GetByIdAsync(Guid id)
    {
        try
        {
            return await context.LoadAsync<Statement>(id);
        }
        catch (Exception ex)
        {
            logger.Log(LogLevel.Error, ex.ToString());
            logger.LogError(ex, "fail to Get Statement from DynamoDb Table");
            return null;
        }
    }

    public async Task<IList<Statement>> GetBuildingsAsync(Guid id, int limit = 10)
    {
        var result = new List<Statement>();

        try
        {
            if (limit <= 0)
            {
                return result;
            }

            var filter = new ScanFilter();
            filter.AddCondition("Id", ScanOperator.IsNotNull);
            var scanConfig = new ScanOperationConfig()
            {
                Limit = limit,
                Filter = filter
            };
            var queryResult = context.FromScanAsync<Statement>(scanConfig);

            do
            {
                result.AddRange(await queryResult.GetNextSetAsync());
            }
            while (!queryResult.IsDone && result.Count < limit);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "fail to list Statements from DynamoDb Table");
            return new List<Statement>();
        }

        return result;
    }

    public async Task<Statement> GetUserAsync(Guid id, string userId)
    {
        try
        {
            return await context.LoadAsync<Statement>(id);
        }
        catch (Exception ex)
        {
            logger.Log(LogLevel.Error, ex.ToString());
            logger.LogError(ex, "fail to Get Statement from DynamoDb Table");
            return null;
        }    
    }
}