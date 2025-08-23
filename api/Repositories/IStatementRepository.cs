using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using aqua.api.Entities;

namespace aqua.api.Repositories;

/// <summary>
/// Sample DynamoDB Table Statement CRUD
/// </summary>
public interface IStatementRepository
{
    /// <summary>
    /// Include new Statement to the DynamoDB Table
    /// </summary>
    /// <param name="id">tenant id</param>
    /// <param name="statement">Statement to include</param>
    /// <param name="attribute"></param>
    /// <returns>success/failure</returns>
    Task<bool> CreateAsync(Guid id, Statement statement, string? attribute);
    
    /// <summary>
    /// Remove existing Statement from DynamoDB Table
    /// </summary>
    /// <param name="statement">Statement to remove</param>
    /// <returns></returns>
    Task<bool> DeleteAsync(Guid id, string rangeKey);

    /// <summary>
    /// List Statement from DynamoDb Table with items limit (default=10)
    /// </summary>
    /// <param name="limit">limit (default=10)</param>
    /// <returns>Collection of Statements</returns>
    Task<IList<Statement>> GetBuildingsAsync(Guid id, int limit = 10);

    Task<IList<Statement>?> GetStatementsAsync(Guid id, string attribute);
    
    /// <summary>
    /// Get Statement by PK
    /// </summary>
    /// <param name="id">Statement`s PK</param>
    /// <returns>Statement object</returns>
    Task<Statement?> GetByIdAsync(Guid id);
    
    /// <summary>
    /// Update Statement content
    /// </summary>
    /// <param name="stmt">Statement to be updated</param>
    /// <returns></returns>
    Task<bool> UpdateAsync(Statement stmt);
    Task<Statement> GetUserAsync(Guid id, string userId);
}