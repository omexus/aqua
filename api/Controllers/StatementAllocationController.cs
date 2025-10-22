using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using aqua.api.Services;
using aqua.api.Dtos;

namespace aqua.api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatementAllocationController : ControllerBase
    {
        private readonly StatementAllocationService _allocationService;
        private readonly ILogger<StatementAllocationController> _logger;

        public StatementAllocationController(
            StatementAllocationService allocationService,
            ILogger<StatementAllocationController> logger)
        {
            _allocationService = allocationService;
            _logger = logger;
        }

        /// <summary>
        /// Allocate statement costs among units
        /// </summary>
        [HttpPost("{condoId}/statements/{statementId}/allocate")]
        public async Task<ActionResult> AllocateStatement(
            Guid condoId, 
            Guid statementId, 
            [FromBody] AllocationRequest request)
        {
            try
            {
                _logger.LogInformation("Allocating statement {StatementId} for condo {CondoId} using method {Method}", 
                    statementId, condoId, request.AllocationMethod);

                var result = await _allocationService.AllocateStatementAsync(
                    statementId, 
                    condoId, 
                    request.AllocationMethod, 
                    "CURRENT_MANAGER", // TODO: Get from auth context
                    request.ManualAmounts);

                if (!result.Success)
                {
                    return BadRequest(new { success = false, error = result.Error });
                }

                return Ok(new { 
                    success = true, 
                    message = "Statement allocated successfully",
                    allocations = result.Allocations.Count,
                    totalAmount = result.TotalAmount
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error allocating statement {StatementId}", statementId);
                return BadRequest(new { success = false, error = "Allocation failed" });
            }
        }

        /// <summary>
        /// Get unit allocations for a specific unit
        /// </summary>
        [HttpGet("{condoId}/units/{unitNumber}/allocations")]
        public async Task<ActionResult<IEnumerable<UnitAllocationDto>>> GetUnitAllocations(
            Guid condoId, 
            string unitNumber, 
            [FromQuery] string? period = null)
        {
            try
            {
                _logger.LogInformation("Getting allocations for unit {UnitNumber} in condo {CondoId}", 
                    unitNumber, condoId);

                var allocations = await _allocationService.GetUnitAllocationsAsync(condoId, unitNumber, period);

                var allocationDtos = allocations.Select(a => new UnitAllocationDto
                {
                    Id = a.Id.ToString(),
                    StatementId = a.StatementId,
                    UnitNumber = a.UnitNumber,
                    UtilityType = a.UtilityType,
                    AllocatedAmount = a.AllocatedAmount,
                    Percentage = a.Percentage,
                    Period = a.Period,
                    IsPaid = a.IsPaid,
                    PaidAt = a.PaidAt,
                    PaymentMethod = a.PaymentMethod,
                    Status = a.Status,
                    DueDate = a.DueDate,
                    CreatedAt = a.CreatedAt
                });

                return Ok(allocationDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting unit allocations for unit {UnitNumber}", unitNumber);
                return BadRequest(new { success = false, error = "Failed to get allocations" });
            }
        }

        /// <summary>
        /// Get all allocations for a specific statement
        /// </summary>
        [HttpGet("{condoId}/statements/{statementId}/allocations")]
        public async Task<ActionResult<IEnumerable<UnitAllocationDto>>> GetStatementAllocations(
            Guid condoId, 
            Guid statementId)
        {
            try
            {
                _logger.LogInformation("Getting allocations for statement {StatementId} in condo {CondoId}", 
                    statementId, condoId);

                var allocations = await _allocationService.GetStatementAllocationsAsync(condoId, statementId);

                var allocationDtos = allocations.Select(a => new UnitAllocationDto
                {
                    Id = a.Id.ToString(),
                    StatementId = a.StatementId,
                    UnitNumber = a.UnitNumber,
                    UtilityType = a.UtilityType,
                    AllocatedAmount = a.AllocatedAmount,
                    Percentage = a.Percentage,
                    Period = a.Period,
                    IsPaid = a.IsPaid,
                    PaidAt = a.PaidAt,
                    PaymentMethod = a.PaymentMethod,
                    Status = a.Status,
                    DueDate = a.DueDate,
                    CreatedAt = a.CreatedAt
                });

                return Ok(allocationDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting statement allocations for statement {StatementId}", statementId);
                return BadRequest(new { success = false, error = "Failed to get allocations" });
            }
        }

        /// <summary>
        /// Mark allocation as paid
        /// </summary>
        [HttpPost("{condoId}/allocations/{allocationId}/pay")]
        public async Task<ActionResult> MarkAllocationAsPaid(
            Guid condoId, 
            Guid allocationId, 
            [FromBody] PaymentRequest request)
        {
            try
            {
                _logger.LogInformation("Marking allocation {AllocationId} as paid", allocationId);

                // TODO: Implement payment tracking
                // This would update the UnitAllocation entity with payment information

                return Ok(new { 
                    success = true, 
                    message = "Allocation marked as paid" 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking allocation {AllocationId} as paid", allocationId);
                return BadRequest(new { success = false, error = "Failed to mark as paid" });
            }
        }

        /// <summary>
        /// Get allocation summary for a condo
        /// </summary>
        [HttpGet("{condoId}/allocations/summary")]
        public async Task<ActionResult<AllocationSummaryDto>> GetAllocationSummary(
            Guid condoId, 
            [FromQuery] string? period = null)
        {
            try
            {
                _logger.LogInformation("Getting allocation summary for condo {CondoId}", condoId);

                // TODO: Implement allocation summary
                // This would aggregate allocation data for reporting

                var summary = new AllocationSummaryDto
                {
                    CondoId = condoId.ToString(),
                    Period = period ?? DateTime.Now.ToString("yyyy-MM"),
                    TotalAllocations = 0,
                    TotalAmount = 0,
                    PaidAmount = 0,
                    OutstandingAmount = 0,
                    UnitsWithAllocations = 0
                };

                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting allocation summary for condo {CondoId}", condoId);
                return BadRequest(new { success = false, error = "Failed to get summary" });
            }
        }
    }

    #region DTOs

    public class UnitAllocationDto
    {
        public string Id { get; set; } = string.Empty;
        public string StatementId { get; set; } = string.Empty;
        public string UnitNumber { get; set; } = string.Empty;
        public string UtilityType { get; set; } = string.Empty;
        public double AllocatedAmount { get; set; }
        public double Percentage { get; set; }
        public string Period { get; set; } = string.Empty;
        public bool IsPaid { get; set; }
        public DateTime? PaidAt { get; set; }
        public string? PaymentMethod { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? DueDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class PaymentRequest
    {
        public string PaymentMethod { get; set; } = string.Empty;
        public string PaymentReference { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public class AllocationSummaryDto
    {
        public string CondoId { get; set; } = string.Empty;
        public string Period { get; set; } = string.Empty;
        public int TotalAllocations { get; set; }
        public double TotalAmount { get; set; }
        public double PaidAmount { get; set; }
        public double OutstandingAmount { get; set; }
        public int UnitsWithAllocations { get; set; }
    }

    #endregion
}
