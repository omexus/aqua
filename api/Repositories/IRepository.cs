using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using aqua.api.Entities;

namespace aqua.api.Repositories;

/// <summary>
/// Sample DynamoDB Table Unit CRUD
/// </summary>
public interface IRepository<T>
{
    /// <summary>
    /// Include new Unit to the DynamoDB Table
    /// </summary>
    /// <param name="id">tenant id</param>
    /// <param name="entity">entity to create</param>
    /// <param name="attribute"></param>
    /// <returns>success/failure</returns>
    Task<bool> CreateAsync(Guid id, T entity, string? attribute);
    
    /// <summary>
    /// Remove existing Unit from DynamoDB Table
    /// </summary>
    /// <param name="Unit">Unit to remove</param>
    /// <returns></returns>
    Task<bool> DeleteAsync(T Unit);
    /// <summary>
    /// Update Unit content
    /// </summary>
    /// <param name="stmt">Unit to be updated</param>
    /// <returns></returns>
    Task<bool> UpdateAsync(T stmt);

    /// <summary>
    /// List Unit from DynamoDb Table with items limit
    /// </summary>
    /// <param name="limit">limit (default=10)</param>
    /// <returns>Collection of Units</returns>
    Task<IList<T>?> GetListAsync(Guid id, string attribute);
    /// <summary>
    /// Get Unit by PK
    /// </summary>
    /// <param name="id">Unit`s PK</param>
    /// <returns>Unit object</returns>
    Task<T?> GetByIdAsync(Guid id, string? attribute = null);    
}