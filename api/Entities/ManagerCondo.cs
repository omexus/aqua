using System;
using Amazon.DynamoDBv2.DataModel;

namespace aqua.api.Entities;

/// <summary>
/// Manager-Condo relationship entity
/// Tracks which managers have access to which condos
/// </summary>
[DynamoDBTable("Statements")]
public class ManagerCondo : IDynamoEntity
{
    [DynamoDBHashKey] //Partition key
    public Guid Id { get; set; } = Guid.Empty;
    [DynamoDBRangeKey]
    public required string Attribute { get; set; }
    
    // Relationship details
    public required string ManagerId { get; set; }
    public required string CondoId { get; set; }
    public string Role { get; set; } = "MANAGER"; // MANAGER, ADMIN, VIEWER
    public bool IsActive { get; set; } = true;
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    public string? AssignedBy { get; set; }
    
    // Condo details for quick access
    public string? CondoName { get; set; }
    public string? CondoPrefix { get; set; }
    
    // Manager permissions for this condo
    public bool CanManageUnits { get; set; } = true;
    public bool CanManageStatements { get; set; } = true;
    public bool CanManagePeriods { get; set; } = true;
    public bool CanViewReports { get; set; } = true;
    
    // Assignment metadata
    public string? Notes { get; set; }
    public DateTime? LastAccessedAt { get; set; }
}
