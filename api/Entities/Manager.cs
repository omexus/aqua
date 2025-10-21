using System;
using Amazon.DynamoDBv2.DataModel;

namespace aqua.api.Entities;

/// <summary>
/// Manager entity for HOA management system
/// Represents a manager who can manage multiple condos
/// </summary>
[DynamoDBTable("Statements")]
public class Manager : IDynamoEntity
{
    [DynamoDBHashKey] //Partition key
    public Guid Id { get; set; } = Guid.Empty;
    [DynamoDBRangeKey]
    public required string Attribute { get; set; }
    
    // Manager details
    public required string GoogleUserId { get; set; }
    public required string Email { get; set; }
    public required string Name { get; set; }
    public string? Picture { get; set; }
    public string Role { get; set; } = "MANAGER";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    
    // Manager preferences
    public string? DefaultCondoId { get; set; }
    public string? TimeZone { get; set; } = "UTC";
    public string? Language { get; set; } = "en";
    
    // Contact information
    public string? Phone { get; set; }
    public string? Address { get; set; }
    
    // Manager status
    public bool IsEmailVerified { get; set; } = false;
    public DateTime? EmailVerifiedAt { get; set; }
}
