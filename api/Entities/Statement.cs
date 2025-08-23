using System;
using Amazon.DynamoDBv2.DataModel;

namespace aqua.api.Entities;

// <summary>
/// Map the Book Class to DynamoDb Table
/// To learn more visit https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DeclarativeTagsList.html
/// </summary>
public class Statement: EntityBase
{
    ///<summary>
    /// Map c# types to DynamoDb Columns 
    /// to learn more visit https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/MidLevelAPILimitations.SupportedTypes.html
    /// <summary>
    public string? From { get; set; }
    public string? To { get; set; }
    public string? Prefix { get; set; }
    public int Generated { get; set; }
    // public string? FileId { get; set; }
    public double? Amount { get; set; }
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Unit { get; set; }
    public string? FileName { get; set; }
    public string? UserId { get; set; }
}
