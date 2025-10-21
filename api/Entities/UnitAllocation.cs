using System;
using Amazon.DynamoDBv2.DataModel;

namespace aqua.api.Entities;

/// <summary>
/// Unit Allocation entity for HOA utility cost splitting
/// Represents individual unit charges from shared utility statements
/// </summary>
[DynamoDBTable("Statements")]
public class UnitAllocation : IDynamoEntity
{
    [DynamoDBHashKey] //Partition key
    public Guid Id { get; set; } = Guid.Empty;
    [DynamoDBRangeKey]
    public required string Attribute { get; set; }
    
    // Allocation details
    public required string StatementId { get; set; }
    public required string UnitNumber { get; set; }
    public required string CondoId { get; set; }
    public required string Period { get; set; }
    public required string UtilityType { get; set; }
    public double AllocatedAmount { get; set; }
    public double Percentage { get; set; } // Percentage of total
    public string? AllocationMethod { get; set; }
    
    // Payment tracking
    public bool IsPaid { get; set; } = false;
    public DateTime? PaidAt { get; set; }
    public string? PaymentMethod { get; set; } // CASH, CHECK, TRANSFER, CARD
    public string? PaymentReference { get; set; } // Check number, transaction ID, etc.
    public string? PaymentNotes { get; set; }
    
    // Unit details for reference
    public string? UnitOwner { get; set; }
    public string? UnitEmail { get; set; }
    public string? UnitPhone { get; set; }
    public double? SquareFootage { get; set; }
    
    // Allocation metadata
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; } // Manager who created the allocation
    public string? Notes { get; set; }
    
    // Due date and reminders
    public DateTime? DueDate { get; set; }
    public DateTime? ReminderSentAt { get; set; }
    public int ReminderCount { get; set; } = 0;
    
    // Status tracking
    public string Status { get; set; } = "PENDING"; // PENDING, PAID, OVERDUE, CANCELLED
    public string? StatusReason { get; set; }
}
