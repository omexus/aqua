# Statement Allocation Design for HOA V1

## Business Requirement
When a manager uploads a shared utility statement (water, electricity, trash), the system needs to:
1. **Split the total amount** among all condo units
2. **Track individual unit allocations** 
3. **Generate unit-specific statements** for tenants
4. **Support different allocation methods** (equal split, by unit size, etc.)

## Current System Analysis

### Existing Entities:
- **Statement**: Represents the uploaded utility bill (total amount, period, utility type)
- **Unit**: Individual condo units that need to be charged
- **Period**: Time period for the statement

### Missing Components:
- **Allocation Logic**: How to split costs among units
- **Unit Allocation Records**: Individual unit charges
- **Allocation Methods**: Different ways to split costs

## Proposed Solution: Statement Allocation System

### 1. Enhanced Statement Entity
```csharp
public class Statement : EntityBase
{
    // Existing fields
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
    
    // New fields for allocation
    public string? UtilityType { get; set; } // WATER, ELECTRICITY, TRASH
    public string? Period { get; set; } // YYYY-MM format
    public double? TotalAmount { get; set; } // Original bill amount
    public string? AllocationMethod { get; set; } // EQUAL, BY_SQUARE_FOOT, BY_UNITS
    public bool IsAllocated { get; set; } // Whether costs have been split
    public DateTime? AllocatedAt { get; set; }
    public int TotalUnits { get; set; } // Number of units to split among
}
```

### 2. New Unit Allocation Entity
```csharp
[DynamoDBTable("Statements")]
public class UnitAllocation : IDynamoEntity
{
    [DynamoDBHashKey]
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
    public bool IsPaid { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? PaymentMethod { get; set; }
    
    // Unit details for reference
    public string? UnitOwner { get; set; }
    public string? UnitEmail { get; set; }
    public double? SquareFootage { get; set; }
}
```

### 3. Database Design for Allocation

```
┌─────────────────────────────────────────────────────────────────┐
│                    Statement Allocation Design                 │
├─────────────────────────────────────────────────────────────────┤
│  Hash Key: PK (String)                                         │
│  Range Key: SK (String)                                        │
│  GSI1PK: GSI1SK (String) - Unit-based queries                  │
│  GSI2PK: GSI2SK (String) - Period-based queries                │
├─────────────────────────────────────────────────────────────────┤
│  Entity Patterns:                                              │
│                                                                 │
│  STATEMENT (Master Bill):                                      │
│  PK: "CONDO#{condoId}"                                         │
│  SK: "STATEMENT#{statementId}"                                 │
│  UtilityType: "WATER|ELECTRICITY|TRASH"                       │
│  TotalAmount: 1500.00                                          │
│  AllocationMethod: "EQUAL"                                     │
│  IsAllocated: true                                             │
│  TotalUnits: 10                                                │
│                                                                 │
│  UNIT ALLOCATION (Individual Charges):                        │
│  PK: "CONDO#{condoId}"                                         │
│  SK: "ALLOCATION#{statementId}#{unitNumber}"                   │
│  GSI1PK: "UNIT#{unitNumber}"                                   │
│  GSI1SK: "ALLOCATION#{statementId}"                            │
│  GSI2PK: "PERIOD#{period}"                                     │
│  GSI2SK: "ALLOCATION#{statementId}"                            │
│  AllocatedAmount: 150.00                                       │
│  Percentage: 10.0                                              │
│  IsPaid: false                                                 │
│                                                                 │
│  UNIT (Reference Data):                                        │
│  PK: "CONDO#{condoId}"                                         │
│  SK: "UNIT#{unitNumber}"                                       │
│  SquareFootage: 1200.0                                         │
│  OwnerName: "John Doe"                                         │
│  OwnerEmail: "john@example.com"                               │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Allocation Methods

#### Method 1: Equal Split (Default)
```csharp
public class EqualSplitAllocation
{
    public List<UnitAllocation> CalculateAllocations(Statement statement, List<DwellUnit> units)
    {
        var allocations = new List<UnitAllocation>();
        var amountPerUnit = statement.TotalAmount / units.Count;
        var percentage = 100.0 / units.Count;
        
        foreach (var unit in units)
        {
            allocations.Add(new UnitAllocation
            {
                Id = Guid.NewGuid(),
                Attribute = $"ALLOCATION#{statement.Id}#{unit.Unit}",
                StatementId = statement.Id.ToString(),
                UnitNumber = unit.Unit,
                CondoId = statement.Id.ToString(),
                Period = statement.Period,
                UtilityType = statement.UtilityType,
                AllocatedAmount = amountPerUnit,
                Percentage = percentage,
                AllocationMethod = "EQUAL",
                UnitOwner = unit.Name,
                UnitEmail = unit.Email
            });
        }
        
        return allocations;
    }
}
```

#### Method 2: By Square Footage
```csharp
public class SquareFootageAllocation
{
    public List<UnitAllocation> CalculateAllocations(Statement statement, List<DwellUnit> units)
    {
        var totalSqFt = units.Sum(u => u.SquareFootage ?? 0);
        var allocations = new List<UnitAllocation>();
        
        foreach (var unit in units)
        {
            var percentage = (unit.SquareFootage ?? 0) / totalSqFt * 100;
            var allocatedAmount = statement.TotalAmount * percentage / 100;
            
            allocations.Add(new UnitAllocation
            {
                // ... similar structure with calculated amounts
                AllocatedAmount = allocatedAmount,
                Percentage = percentage,
                AllocationMethod = "BY_SQUARE_FOOT"
            });
        }
        
        return allocations;
    }
}
```

### 5. API Endpoints for Allocation

#### Allocate Statement
```csharp
[HttpPost("{condoId}/statements/{statementId}/allocate")]
public async Task<ActionResult> AllocateStatement(Guid condoId, Guid statementId, [FromBody] AllocationRequest request)
{
    // 1. Get the statement
    var statement = await _statementRepository.GetByIdAsync(statementId, "STATEMENT");
    
    // 2. Get all units for the condo
    var units = await _unitRepository.GetUnitsByCondoAsync(condoId);
    
    // 3. Calculate allocations based on method
    var allocations = _allocationService.CalculateAllocations(statement, units, request.AllocationMethod);
    
    // 4. Save allocations
    await _allocationRepository.SaveAllocationsAsync(allocations);
    
    // 5. Mark statement as allocated
    statement.IsAllocated = true;
    statement.AllocatedAt = DateTime.UtcNow;
    await _statementRepository.UpdateAsync(statement);
    
    return Ok(new { Message = "Statement allocated successfully", Allocations = allocations.Count });
}
```

#### Get Unit Allocations
```csharp
[HttpGet("{condoId}/units/{unitNumber}/allocations")]
public async Task<ActionResult<IEnumerable<UnitAllocationDto>>> GetUnitAllocations(Guid condoId, string unitNumber, [FromQuery] string? period = null)
{
    var allocations = await _allocationRepository.GetUnitAllocationsAsync(condoId, unitNumber, period);
    return Ok(allocations.Select(a => new UnitAllocationDto
    {
        StatementId = a.StatementId,
        UtilityType = a.UtilityType,
        Amount = a.AllocatedAmount,
        Percentage = a.Percentage,
        Period = a.Period,
        IsPaid = a.IsPaid,
        PaidAt = a.PaidAt
    }));
}
```

#### Get Statement Allocations
```csharp
[HttpGet("{condoId}/statements/{statementId}/allocations")]
public async Task<ActionResult<IEnumerable<UnitAllocationDto>>> GetStatementAllocations(Guid condoId, Guid statementId)
{
    var allocations = await _allocationRepository.GetStatementAllocationsAsync(condoId, statementId);
    return Ok(allocations);
}
```

### 6. Frontend Integration

#### Statement Upload Flow:
1. **Upload Statement**: Manager uploads utility bill
2. **Review Statement**: System shows total amount, period, utility type
3. **Select Allocation Method**: Choose how to split costs
4. **Preview Allocations**: Show calculated amounts per unit
5. **Confirm Allocation**: Generate individual unit charges
6. **Send Notifications**: Notify unit owners of their charges

#### Unit Owner Dashboard:
1. **View Charges**: See allocated amounts for each utility
2. **Payment Status**: Track which charges are paid
3. **Payment History**: View past payments
4. **Download Statements**: Get individual unit statements

### 7. Implementation Priority

#### Phase 1: Core Allocation (V1)
- [ ] Enhanced Statement entity with allocation fields
- [ ] UnitAllocation entity for individual charges
- [ ] Equal split allocation method
- [ ] Basic allocation API endpoints
- [ ] Statement allocation workflow

#### Phase 2: Advanced Features
- [ ] Square footage allocation method
- [ ] Custom allocation percentages
- [ ] Payment tracking
- [ ] Email notifications
- [ ] Unit owner dashboard

#### Phase 3: Reporting & Analytics
- [ ] Allocation reports
- [ ] Payment tracking reports
- [ ] Utility cost trends
- [ ] Unit payment history

## Benefits of This Design

1. **Flexible Allocation**: Support multiple allocation methods
2. **Audit Trail**: Track all allocations and payments
3. **Scalable**: Works for any number of units
4. **Transparent**: Unit owners can see exactly how costs are calculated
5. **Automated**: Reduces manual calculation errors
6. **Future-Ready**: Easy to add new allocation methods

This design provides a complete solution for splitting shared utility costs among condo units while maintaining transparency and flexibility for HOA managers.
