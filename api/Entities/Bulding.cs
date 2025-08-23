using System;
using System.Collections.Generic;
using Amazon.DynamoDBv2.DataModel;

namespace aqua.api.Entities;

// <summary>
/// Map the Book Class to DynamoDb Table
/// To learn more visit https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DeclarativeTagsList.html
/// </summary>
[DynamoDBTable("sam-svls-apiBookCatalog")]
public class Building
{
    ///<summary>
    /// Map c# types to DynamoDb Columns 
    /// to learn more visit https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/MidLevelAPILimitations.SupportedTypes.html
    /// <summary>
    [DynamoDBHashKey] //Partition key
    public Guid Id { get; set; } = Guid.Empty;

    [DynamoDBProperty]
    public string Title { get; set; } = string.Empty;

    [DynamoDBProperty]
    public string? ISBN { get; set; }

    [DynamoDBProperty] //String Set datatype
    public List<string>? Authors { get; set; }

    [DynamoDBIgnore]
    public string? CoverPage { get; set; }
}
