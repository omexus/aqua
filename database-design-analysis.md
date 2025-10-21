# Database Design Analysis - Aqua Workspace (HOA Management System)

## Business Context
- **Multi-tenant HOA Management System**
- **Manager can manage multiple condos**
- **Statements = Shared utility expenses** (water, electricity, trash disposal)
- **V1 Focus**: Manager-centric, tenant management is V2
- **Current Architecture**: Single Table Design in DynamoDB

## Current Database Structure

### Single Table Design (DynamoDB)
All entities are stored in a single table called `"Statements"` using a **Single Table Design** pattern.

### Entity Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                        DynamoDB Table: "Statements"             │
├─────────────────────────────────────────────────────────────────┤
│  Hash Key (PK): Id (GUID)                                      │
│  Range Key (SK): Attribute (String)                             │
├─────────────────────────────────────────────────────────────────┤
│  Entity Types:                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │     CONDO       │  │      USER       │  │      UNIT       │ │
│  │                 │  │                 │  │                 │ │
│  │ Id: GUID        │  │ Id: GUID        │  │ Id: GUID        │ │
│  │ Attribute:      │  │ Attribute:      │  │ Attribute:      │ │
│  │ "CONDO"         │  │ "USER"          │  │ "UNIT"          │ │
│  │ Name: string    │  │ UserId: string  │  │ UserId: string  │ │
│  │ Prefix: string  │  │ Name: string    │  │ Prefix: string  │ │
│  │                 │  │ Email: string   │  │ Name: string    │ │
│  │                 │  │ Unit: string    │  │ Email: string   │ │
│  │                 │  │ Role: string    │  │ Unit: string    │ │
│  │                 │  │                 │  │ Role: string    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │     PERIOD      │  │   STATEMENT     │  │   BUILDING     │ │
│  │                 │  │                 │  │                 │ │
│  │ Id: GUID        │  │ Id: GUID        │  │ Id: GUID        │ │
│  │ Attribute:      │  │ Attribute:      │  │ Attribute:      │ │
│  │ "PERIOD"        │  │ "STATEMENT"     │  │ "BUILDING"      │ │
│  │ From: string    │  │ From: string    │  │ Title: string   │ │
│  │ To: string      │  │ To: string      │  │ ISBN: string    │ │
│  │ Prefix: string │  │ Prefix: string  │  │ Authors: List   │ │
│  │ Generated: int  │  │ Generated: int  │  │                 │ │
│  │ Amount: double  │  │ Amount: double  │  │                 │ │
│  │                 │  │ Name: string    │  │                 │ │
│  │                 │  │ Email: string   │  │                 │ │
│  │                 │  │ Unit: string    │  │                 │ │
│  │                 │  │ FileName: str   │  │                 │ │
│  │                 │  │ UserId: string  │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Access Patterns

### Current Query Patterns:
1. **Get Condo by ID**: `Id = condoId AND Attribute = "CONDO"`
2. **Get Users for Condo**: `Id = condoId AND Attribute = "USER"`
3. **Get Units for Condo**: `Id = condoId AND Attribute = "UNIT"`
4. **Get Periods for Condo**: `Id = condoId AND Attribute = "PERIOD"`
5. **Get Statements for Condo**: `Id = condoId AND Attribute = "STATEMENT"`

### Access Pattern Issues:
- **No GSI (Global Secondary Index)**: All queries use the same partition key
- **Limited Query Flexibility**: Can only query by condo ID + entity type
- **No Cross-Condo Queries**: Cannot easily find users across all condos
- **No Time-Based Queries**: Cannot efficiently query statements by date range

## Relationships

```
CONDO (1) ──────── (N) USER
  │
  ├── (N) UNIT
  │
  ├── (N) PERIOD
  │
  └── (N) STATEMENT
```

## Issues and Recommendations

### 🚨 Current Issues:

1. **Single Table Overuse**: Using single table for all entities may not be optimal
2. **No GSI**: Limited query patterns
3. **Inconsistent Entity Design**: Some entities have different structures
4. **No Relationships**: No foreign key relationships between entities
5. **Building Entity**: Appears to be unused/legacy code

### 💡 Recommended Improvements:

#### Option 1: Multi-Tenant Enhanced Single Table Design
```
┌─────────────────────────────────────────────────────────────────┐
│              Multi-Tenant Enhanced Single Table Design         │
├─────────────────────────────────────────────────────────────────┤
│  Hash Key: PK (String)                                         │
│  Range Key: SK (String)                                        │
│  GSI1PK: GSI1SK (String) - Manager Cross-Condo Queries        │
│  GSI2PK: GSI2SK (String) - Time-Based Queries                 │
├─────────────────────────────────────────────────────────────────┤
│  Entity Patterns:                                              │
│                                                                 │
│  MANAGER:                                                      │
│  PK: "MANAGER#{managerId}"                                     │
│  SK: "METADATA"                                                │
│  GSI1PK: "MANAGER#{managerId}"                                │
│  GSI1SK: "METADATA"                                            │
│                                                                 │
│  CONDO:                                                        │
│  PK: "CONDO#{condoId}"                                         │
│  SK: "METADATA"                                                │
│  ManagerId: "MANAGER#{managerId}"                             │
│                                                                 │
│  MANAGER-CONDO RELATIONSHIP:                                  │
│  PK: "MANAGER#{managerId}"                                     │
│  SK: "CONDO#{condoId}"                                         │
│  GSI1PK: "CONDO#{condoId}"                                     │
│  GSI1SK: "MANAGER#{managerId}"                                │
│                                                                 │
│  UNIT:                                                         │
│  PK: "CONDO#{condoId}"                                         │
│  SK: "UNIT#{unitNumber}"                                       │
│                                                                 │
│  PERIOD:                                                       │
│  PK: "CONDO#{condoId}"                                         │
│  SK: "PERIOD#{periodId}"                                       │
│  GSI1PK: "PERIOD#{periodId}"                                  │
│  GSI1SK: "CONDO#{condoId}"                                     │
│                                                                 │
│  STATEMENT (Shared Utility Expense):                          │
│  PK: "CONDO#{condoId}"                                         │
│  SK: "STATEMENT#{statementId}"                                 │
│  GSI1PK: "PERIOD#{periodId}"                                  │
│  GSI1SK: "STATEMENT#{statementId}"                             │
│  GSI2PK: "UTILITY#{utilityType}"                               │
│  GSI2SK: "STATEMENT#{statementId}"                             │
│  UtilityType: "WATER|ELECTRICITY|TRASH"                     │
│  Amount: Decimal                                               │
│  Period: "YYYY-MM"                                             │
└─────────────────────────────────────────────────────────────────┘
```

#### Option 2: Multi-Table Design
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CONDOS        │    │     USERS       │    │     UNITS      │
│                 │    │                 │    │                 │
│ PK: condoId     │    │ PK: userId      │    │ PK: unitId      │
│ Name: string    │    │ Name: string    │    │ Unit: string    │
│ Prefix: string  │    │ Email: string   │    │ CondoId: GUID  │
│                 │    │ CondoId: GUID   │    │ UserId: GUID    │
│                 │    │ Unit: string    │    │                 │
│                 │    │ Role: string    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐    ┌─────────────────┐
                    │    PERIODS      │    │   STATEMENTS    │
                    │                 │    │                 │
                    │ PK: periodId    │    │ PK: statementId │
                    │ CondoId: GUID  │    │ CondoId: GUID   │
                    │ From: DateTime  │    │ UserId: GUID    │
                    │ To: DateTime    │    │ PeriodId: GUID  │
                    │ Amount: Decimal   │    │ Amount: Decimal │
                    │                 │    │ FileName: str   │
                    └─────────────────┘    └─────────────────┘
```

### 🎯 Multi-Tenant Specific Recommendations:

1. **Manager-Condo Relationship**:
   - **GSI1**: Enable managers to query all their condos
   - **Bidirectional**: Query condos by manager, managers by condo
   - **Access Control**: Ensure managers only see their condos

2. **Utility Expense Management**:
   - **GSI2**: Query statements by utility type (WATER, ELECTRICITY, TRASH)
   - **Time-based**: Query statements by period/date range
   - **Condo-scoped**: All queries scoped to specific condo

3. **V1 Focus Areas**:
   - **Manager Dashboard**: Show all condos managed by a manager
   - **Condo Management**: CRUD operations for condos, units, periods
   - **Statement Management**: Create/manage shared utility expenses
   - **Reporting**: Generate expense reports per condo/period

4. **V2 Preparation**:
   - **Tenant Entity**: Ready for future tenant management
   - **User Roles**: Manager vs Tenant role separation
   - **Access Patterns**: Design for future tenant access

### 🔧 Implementation Priority for HOA System:

1. **High Priority**: 
   - Manager-Condo relationship tracking
   - Utility expense statement management
   - Cross-condo queries for managers

2. **Medium Priority**: 
   - Time-based queries for reporting
   - Utility type filtering
   - Period management

3. **Low Priority**: 
   - Tenant management (V2)
   - Advanced reporting features

## Conclusion

The current single-table design works for basic CRUD operations but lacks flexibility for complex queries. The recommended enhancements would provide better query performance and more flexible data access patterns while maintaining the benefits of DynamoDB's single-table design.
