using System;
using Amazon.DynamoDBv2.DataModel;

namespace aqua.api.Entities;

// <summary>
/// Map the User Class to DynamoDb Table
/// </summary>
// [DynamoDBTable("Statements")]
[DynamoDBTable("Statements")]
public class Condo: IDynamoEntity
{
    [DynamoDBHashKey] //Partition key
    public Guid Id { get; set; } = Guid.Empty;
    [DynamoDBRangeKey]
    public required string Attribute { get; set; }   
    public string? Name { get; set; }
    public string? Prefix { get; set; }
}

