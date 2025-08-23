using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using aqua.api.Entities;

namespace aqua.api.Repositories;

/// <summary>
/// Sample DynamoDB Table User CRUD
/// </summary>
public interface IUserRepository
{
    /// <summary>
    /// Include new User to the DynamoDB Table
    /// </summary>
    /// <param name="id">tenant id</param>
    /// <param name="User">User to include</param>
    /// <param name="attribute"></param>
    /// <returns>success/failure</returns>
    Task<bool> CreateAsync(Guid id, User user, string? attribute);
    
    /// <summary>
    /// Remove existing User from DynamoDB Table
    /// </summary>
    /// <param name="User">User to remove</param>
    /// <returns></returns>
    Task<bool> DeleteAsync(User User);
    /// <summary>
    /// Update User content
    /// </summary>
    /// <param name="stmt">User to be updated</param>
    /// <returns></returns>
    Task<bool> UpdateAsync(User stmt);

    /// <summary>
    /// List User from DynamoDb Table with items limit
    /// </summary>
    /// <param name="limit">limit (default=10)</param>
    /// <returns>Collection of Users</returns>
    Task<IList<User>?> GetListAsync(Guid id, string attribute);
    /// <summary>
    /// Get User by PK
    /// </summary>
    /// <param name="id">User`s PK</param>
    /// <returns>User object</returns>
    Task<User?> GetByIdAsync(Guid id);    
}