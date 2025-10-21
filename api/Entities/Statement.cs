using System;
using Amazon.DynamoDBv2.DataModel;

namespace aqua.api.Entities;

/// <summary>
/// Enhanced Statement entity for HOA utility expense management
/// Represents shared utility bills that need to be allocated among condo units
/// </summary>
public class Statement: EntityBase
{
    ///<summary>
    /// Map c# types to DynamoDb Columns 
    /// to learn more visit https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/MidLevelAPILimitations.SupportedTypes.html
    /// <summary>
    
    // Original statement fields
    public string? From { get; set; }
    public string? To { get; set; }
    public string? Prefix { get; set; }
    public int Generated { get; set; }
    public double? Amount { get; set; }
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Unit { get; set; }
    public string? FileName { get; set; }
    public string? UserId { get; set; }
    
    // Enhanced fields for allocation
    public string? UtilityType { get; set; } // WATER, ELECTRICITY, TRASH, GAS, etc.
    public string? Period { get; set; } // YYYY-MM format
    public double? TotalAmount { get; set; } // Original bill amount
    public string? AllocationMethod { get; set; } // EQUAL, BY_SQUARE_FOOT, BY_UNITS, CUSTOM
    public bool IsAllocated { get; set; } = false; // Whether costs have been split
    public DateTime? AllocatedAt { get; set; }
    public int TotalUnits { get; set; } // Number of units to split among
    
    // Statement metadata
    public string? Description { get; set; }
    public string? Provider { get; set; } // Utility company name
    public string? AccountNumber { get; set; }
    public DateTime? DueDate { get; set; }
    public string? Status { get; set; } = "PENDING"; // PENDING, ALLOCATED, PAID, OVERDUE
    
    // File management
    public string? FileUrl { get; set; }
    public string? FileType { get; set; }
    public long? FileSize { get; set; }
    
    // Allocation tracking
    public double? AllocatedAmount { get; set; } // Total amount allocated to units
    public double? RemainingAmount { get; set; } // Amount not yet allocated
    public int AllocatedUnits { get; set; } // Number of units with allocations
}
