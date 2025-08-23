using System;
using Amazon.DynamoDBv2.DataModel;

namespace aqua.api.Entities;

// <summary>
/// Map the User Class to DynamoDb Table
/// </summary>
[DynamoDBTable("Statements")]
public class User
{
    [DynamoDBHashKey] //Partition key
    public Guid Id { get; set; } = Guid.Empty;
    [DynamoDBRangeKey]
    public required string Attribute { get; set; }
    public required string UserId { get; set; }
   
    public string? Name { get; set; }
    public string? Email { get; set; }
    [DynamoDBGlobalSecondaryIndexRangeKey]    
    public string? Unit { get; set; }
    public string? Role { get; set; }
}

