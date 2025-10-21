using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using aqua.api.Entities;
using aqua.api.Dtos;

namespace aqua.api.Services
{
    /// <summary>
    /// Service for allocating shared utility costs among condo units
    /// </summary>
    public class StatementAllocationService
    {
        private readonly IDynamoDBContext _context;
        private readonly ILogger<StatementAllocationService> _logger;

        public StatementAllocationService(IDynamoDBContext context, ILogger<StatementAllocationService> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Allocate statement costs among units using specified method
        /// </summary>
        public async Task<AllocationResult> AllocateStatementAsync(
            Guid statementId, 
            Guid condoId, 
            string allocationMethod, 
            string managerId)
        {
            try
            {
                _logger.LogInformation("Starting allocation for statement {StatementId} using method {Method}", 
                    statementId, allocationMethod);

                // 1. Get the statement
                var statement = await GetStatementById(statementId);
                if (statement == null)
                {
                    return new AllocationResult { Success = false, Error = "Statement not found" };
                }

                // 2. Get all units for the condo
                var units = await GetUnitsByCondo(condoId);
                if (!units.Any())
                {
                    return new AllocationResult { Success = false, Error = "No units found for condo" };
                }

                // 3. Calculate allocations based on method
                var allocations = CalculateAllocations(statement, units, allocationMethod);

                // 4. Save allocations
                await SaveAllocationsAsync(allocations);

                // 5. Update statement as allocated
                await UpdateStatementAsAllocated(statement, allocations.Count);

                _logger.LogInformation("Successfully allocated statement {StatementId} to {UnitCount} units", 
                    statementId, allocations.Count);

                return new AllocationResult
                {
                    Success = true,
                    Allocations = allocations,
                    TotalUnits = allocations.Count,
                    TotalAmount = allocations.Sum(a => a.AllocatedAmount)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error allocating statement {StatementId}", statementId);
                return new AllocationResult { Success = false, Error = "Allocation failed" };
            }
        }

        /// <summary>
        /// Get allocations for a specific unit
        /// </summary>
        public async Task<List<UnitAllocation>> GetUnitAllocationsAsync(Guid condoId, string unitNumber, string? period = null)
        {
            try
            {
                var query = _context.QueryAsync<UnitAllocation>(new QueryOperationConfig
                {
                    KeyExpression = new Expression
                    {
                        ExpressionStatement = "Id = :condoId AND begins_with(Attribute, :prefix)",
                        ExpressionAttributeValues = new Dictionary<string, DynamoDBEntry>
                        {
                            {":condoId", condoId},
                            {":prefix", $"ALLOCATION#{unitNumber}#"}
                        }
                    }
                });

                var allocations = await query.GetRemainingAsync();

                if (!string.IsNullOrEmpty(period))
                {
                    allocations = allocations.Where(a => a.Period == period).ToList();
                }

                return allocations;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting unit allocations for unit {UnitNumber}", unitNumber);
                return new List<UnitAllocation>();
            }
        }

        /// <summary>
        /// Get allocations for a specific statement
        /// </summary>
        public async Task<List<UnitAllocation>> GetStatementAllocationsAsync(Guid condoId, Guid statementId)
        {
            try
            {
                var query = _context.QueryAsync<UnitAllocation>(new QueryOperationConfig
                {
                    KeyExpression = new Expression
                    {
                        ExpressionStatement = "Id = :condoId AND begins_with(Attribute, :prefix)",
                        ExpressionAttributeValues = new Dictionary<string, DynamoDBEntry>
                        {
                            {":condoId", condoId},
                            {":prefix", $"ALLOCATION#{statementId}#"}
                        }
                    }
                });

                return await query.GetRemainingAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting statement allocations for statement {StatementId}", statementId);
                return new List<UnitAllocation>();
            }
        }

        #region Private Methods

        private async Task<Statement?> GetStatementById(Guid statementId)
        {
            try
            {
                return await _context.LoadAsync<Statement>(statementId, "STATEMENT");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting statement {StatementId}", statementId);
                return null;
            }
        }

        private async Task<List<DwellUnit>> GetUnitsByCondo(Guid condoId)
        {
            try
            {
                var query = _context.QueryAsync<DwellUnit>(new QueryOperationConfig
                {
                    KeyExpression = new Expression
                    {
                        ExpressionStatement = "Id = :condoId AND begins_with(Attribute, :prefix)",
                        ExpressionAttributeValues = new Dictionary<string, DynamoDBEntry>
                        {
                            {":condoId", condoId},
                            {":prefix", "UNIT#"}
                        }
                    }
                });

                return await query.GetRemainingAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting units for condo {CondoId}", condoId);
                return new List<DwellUnit>();
            }
        }

        private List<UnitAllocation> CalculateAllocations(Statement statement, List<DwellUnit> units, string allocationMethod)
        {
            var allocations = new List<UnitAllocation>();

            switch (allocationMethod.ToUpper())
            {
                case "EQUAL":
                    allocations = CalculateEqualAllocations(statement, units);
                    break;
                case "BY_SQUARE_FOOT":
                    allocations = CalculateSquareFootageAllocations(statement, units);
                    break;
                case "BY_UNITS":
                    allocations = CalculateUnitBasedAllocations(statement, units);
                    break;
                default:
                    allocations = CalculateEqualAllocations(statement, units);
                    break;
            }

            return allocations;
        }

        private List<UnitAllocation> CalculateEqualAllocations(Statement statement, List<DwellUnit> units)
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
                    Period = statement.Period ?? "",
                    UtilityType = statement.UtilityType ?? "",
                    AllocatedAmount = amountPerUnit ?? 0.0,
                    Percentage = percentage,
                    AllocationMethod = "EQUAL",
                    UnitOwner = unit.Name,
                    UnitEmail = unit.Email,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "SYSTEM" // TODO: Get from current manager
                });
            }

            return allocations;
        }

        private List<UnitAllocation> CalculateSquareFootageAllocations(Statement statement, List<DwellUnit> units)
        {
            var allocations = new List<UnitAllocation>();
            var totalSqFt = units.Sum(u => u.SquareFootage ?? 0);

            if (totalSqFt == 0)
            {
                // Fallback to equal allocation if no square footage data
                return CalculateEqualAllocations(statement, units);
            }

            foreach (var unit in units)
            {
                var percentage = (unit.SquareFootage ?? 0) / totalSqFt * 100;
                var allocatedAmount = statement.TotalAmount * percentage / 100;

                allocations.Add(new UnitAllocation
                {
                    Id = Guid.NewGuid(),
                    Attribute = $"ALLOCATION#{statement.Id}#{unit.Unit}",
                    StatementId = statement.Id.ToString(),
                    UnitNumber = unit.Unit,
                    CondoId = statement.Id.ToString(),
                    Period = statement.Period ?? "",
                    UtilityType = statement.UtilityType ?? "",
                    AllocatedAmount = allocatedAmount ?? 0.0,
                    Percentage = percentage,
                    AllocationMethod = "BY_SQUARE_FOOT",
                    UnitOwner = unit.Name,
                    UnitEmail = unit.Email,
                    SquareFootage = unit.SquareFootage,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "SYSTEM" // TODO: Get from current manager
                });
            }

            return allocations;
        }

        private List<UnitAllocation> CalculateUnitBasedAllocations(Statement statement, List<DwellUnit> units)
        {
            // For now, this is the same as equal allocation
            // In the future, this could be based on unit type, size, or other factors
            return CalculateEqualAllocations(statement, units);
        }

        private async Task SaveAllocationsAsync(List<UnitAllocation> allocations)
        {
            try
            {
                foreach (var allocation in allocations)
                {
                    await _context.SaveAsync(allocation);
                }

                _logger.LogInformation("Saved {Count} allocations", allocations.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving allocations");
                throw;
            }
        }

        private async Task UpdateStatementAsAllocated(Statement statement, int allocatedUnits)
        {
            try
            {
                statement.IsAllocated = true;
                statement.AllocatedAt = DateTime.UtcNow;
                statement.AllocatedUnits = allocatedUnits;
                statement.Status = "ALLOCATED";

                await _context.SaveAsync(statement);

                _logger.LogInformation("Updated statement {StatementId} as allocated", statement.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating statement as allocated");
                throw;
            }
        }

        #endregion
    }

    #region DTOs

    public class AllocationResult
    {
        public bool Success { get; set; }
        public string? Error { get; set; }
        public List<UnitAllocation> Allocations { get; set; } = new();
        public int TotalUnits { get; set; }
        public double TotalAmount { get; set; }
    }

    public class AllocationRequest
    {
        public string AllocationMethod { get; set; } = "EQUAL";
        public string? Notes { get; set; }
    }

    #endregion
}
