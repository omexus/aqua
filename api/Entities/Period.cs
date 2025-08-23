using System;
using Amazon.DynamoDBv2.DataModel;

namespace aqua.api.Entities;

// <summary>
/// Map the Book Class to DynamoDb Table
/// To learn more visit https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DeclarativeTagsList.html
/// </summary>
public class Period: EntityBase
{
    public string? From { get; set; }
    public string? To { get; set; }
    public string? Prefix { get; set; }
    public int Generated { get; set; }
    // public string? FileId { get; set; }
    public double? Amount { get; set; }
    
}
