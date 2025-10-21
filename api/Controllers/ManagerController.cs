using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using aqua.api.Entities;
using aqua.api.Repositories;

namespace aqua.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ManagerController : ControllerBase
    {
        private readonly ILogger<ManagerController> _logger;
        private readonly IRepository<Manager> _managerRepository;
        private readonly IRepository<ManagerCondo> _managerCondoRepository;
        private readonly IRepository<Condo> _condoRepository;

        public ManagerController(
            ILogger<ManagerController> logger,
            IRepository<Manager> managerRepository,
            IRepository<ManagerCondo> managerCondoRepository,
            IRepository<Condo> condoRepository)
        {
            _logger = logger;
            _managerRepository = managerRepository;
            _managerCondoRepository = managerCondoRepository;
            _condoRepository = condoRepository;
        }

        /// <summary>
        /// Get all managers
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ManagerDto>>> GetManagers()
        {
            try
            {
                _logger.LogInformation("Fetching all managers");
                
                // For now, return empty list since we don't have GetAllAsync
                // In a real implementation, you would need to implement GetAllAsync in the repository
                var managers = new List<Manager>();
                
                var managerDtos = managers.Select(m => new ManagerDto
                {
                    Id = m.Id,
                    Email = m.Email,
                    Name = m.Name,
                    Role = m.Role,
                    GoogleUserId = m.GoogleUserId,
                    CreatedAt = m.CreatedAt
                });

                return Ok(managerDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching managers");
                return StatusCode(500, new { success = false, error = "Failed to fetch managers" });
            }
        }

        /// <summary>
        /// Get a specific manager by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ManagerDto>> GetManager(Guid id)
        {
            try
            {
                _logger.LogInformation("Fetching manager {ManagerId}", id);
                
                var manager = await _managerRepository.GetByIdAsync(id, "MANAGER");
                if (manager == null)
                {
                    return NotFound(new { success = false, error = "Manager not found" });
                }

                var managerDto = new ManagerDto
                {
                    Id = manager.Id,
                    Email = manager.Email,
                    Name = manager.Name,
                    Role = manager.Role,
                    GoogleUserId = manager.GoogleUserId,
                    CreatedAt = manager.CreatedAt,
                };

                return Ok(managerDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching manager {ManagerId}", id);
                return StatusCode(500, new { success = false, error = "Failed to fetch manager" });
            }
        }

        /// <summary>
        /// Create a new manager
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ManagerDto>> CreateManager([FromBody] CreateManagerRequest request)
        {
            try
            {
                _logger.LogInformation("Creating manager for email {Email}", request.Email);

                // Check if manager already exists
                var existingManager = await GetManagerByEmail(request.Email);
                if (existingManager != null)
                {
                    return BadRequest(new { success = false, error = "Manager with this email already exists" });
                }

                // Create new manager
                var manager = new Manager
                {
                    Id = Guid.NewGuid(),
                    Attribute = "MANAGER",
                    Email = request.Email,
                    Name = request.Name,
                    GoogleUserId = request.GoogleUserId ?? "",
                    Role = request.Role ?? "Manager",
                    CreatedAt = DateTime.UtcNow
                };

                await _managerRepository.CreateAsync(manager.Id, manager, "MANAGER");

                _logger.LogInformation("Manager created with ID {ManagerId}", manager.Id);

                var managerDto = new ManagerDto
                {
                    Id = manager.Id,
                    Email = manager.Email,
                    Name = manager.Name,
                    Role = manager.Role,
                    GoogleUserId = manager.GoogleUserId,
                    CreatedAt = manager.CreatedAt,
                };

                return CreatedAtAction(nameof(GetManager), new { id = manager.Id }, managerDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating manager");
                return StatusCode(500, new { success = false, error = "Failed to create manager" });
            }
        }

        /// <summary>
        /// Assign a manager to a condo
        /// </summary>
        [HttpPost("{managerId}/condos")]
        public async Task<ActionResult> AssignManagerToCondo(Guid managerId, [FromBody] AssignCondoRequest request)
        {
            try
            {
                _logger.LogInformation("Assigning manager {ManagerId} to condo {CondoId}", managerId, request.CondoId);

                // Verify manager exists
                var manager = await _managerRepository.GetByIdAsync(managerId, "MANAGER");
                if (manager == null)
                {
                    return NotFound(new { success = false, error = "Manager not found" });
                }

                // Verify condo exists
                var condo = await _condoRepository.GetByIdAsync(request.CondoId, "CONDO");
                if (condo == null)
                {
                    return NotFound(new { success = false, error = "Condo not found" });
                }

                // Check if assignment already exists
                var existingAssignment = await GetManagerCondoAssignment(managerId, request.CondoId);
                if (existingAssignment != null)
                {
                    return BadRequest(new { success = false, error = "Manager is already assigned to this condo" });
                }

                // Create manager-condo assignment
                var managerCondo = new ManagerCondo
                {
                    Id = managerId,
                    Attribute = $"MANAGERCONDO#{request.CondoId}",
                    ManagerId = managerId.ToString(),
                    CondoId = request.CondoId.ToString(),
                    CondoName = condo.Name,
                    CondoPrefix = condo.Prefix,
                    AssignedAt = DateTime.UtcNow
                };

                await _managerCondoRepository.CreateAsync(managerId, managerCondo, $"MANAGERCONDO#{request.CondoId}");

                _logger.LogInformation("Manager {ManagerId} assigned to condo {CondoId}", managerId, request.CondoId);

                return Ok(new { success = true, message = "Manager assigned to condo successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning manager to condo");
                return StatusCode(500, new { success = false, error = "Failed to assign manager to condo" });
            }
        }

        /// <summary>
        /// Get condos assigned to a manager
        /// </summary>
        [HttpGet("{managerId}/condos")]
        public async Task<ActionResult<IEnumerable<CondoDto>>> GetManagerCondos(Guid managerId)
        {
            try
            {
                _logger.LogInformation("Fetching condos for manager {ManagerId}", managerId);

                // Get all manager-condo assignments for this manager
                var assignments = await GetManagerCondoAssignments(managerId);
                
                var condoDtos = assignments.Select(a => new CondoDto
                {
                    Id = a.CondoId.ToString(),
                    Name = a.CondoName,
                    Prefix = a.CondoPrefix
                });

                return Ok(condoDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching manager condos");
                return StatusCode(500, new { success = false, error = "Failed to fetch manager condos" });
            }
        }

        /// <summary>
        /// Remove a manager from a condo
        /// </summary>
        [HttpDelete("{managerId}/condos/{condoId}")]
        public async Task<ActionResult> RemoveManagerFromCondo(Guid managerId, Guid condoId)
        {
            try
            {
                _logger.LogInformation("Removing manager {ManagerId} from condo {CondoId}", managerId, condoId);

                var assignment = await GetManagerCondoAssignment(managerId, condoId);
                if (assignment == null)
                {
                    return NotFound(new { success = false, error = "Manager is not assigned to this condo" });
                }

                // Create a temporary entity for deletion
                var tempEntity = new ManagerCondo
                {
                    Id = managerId,
                    Attribute = $"MANAGERCONDO#{condoId}",
                    ManagerId = managerId.ToString(),
                    CondoId = condoId.ToString()
                };
                await _managerCondoRepository.DeleteAsync(tempEntity);

                _logger.LogInformation("Manager {ManagerId} removed from condo {CondoId}", managerId, condoId);

                return Ok(new { success = true, message = "Manager removed from condo successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing manager from condo");
                return StatusCode(500, new { success = false, error = "Failed to remove manager from condo" });
            }
        }

        #region Private Methods

        private async Task<Manager?> GetManagerByEmail(string email)
        {
            try
            {
                // For now, return null since we don't have GetAllAsync
                // In a real implementation, you would need to implement this in the repository
                return null;
            }
            catch
            {
                return null;
            }
        }

        private async Task<ManagerCondo?> GetManagerCondoAssignment(Guid managerId, Guid condoId)
        {
            try
            {
                return await _managerCondoRepository.GetByIdAsync(managerId, $"MANAGERCONDO#{condoId}");
            }
            catch
            {
                return null;
            }
        }

        private async Task<IEnumerable<ManagerCondo>> GetManagerCondoAssignments(Guid managerId)
        {
            try
            {
                // For now, return empty list since we don't have GetAllAsync
                // In a real implementation, you would need to implement this in the repository
                return Enumerable.Empty<ManagerCondo>();
            }
            catch
            {
                return Enumerable.Empty<ManagerCondo>();
            }
        }

        #endregion
    }

    #region DTOs

    public class ManagerDto
    {
        public Guid Id { get; set; }
        public string? Email { get; set; }
        public string? Name { get; set; }
        public string? Role { get; set; }
        public string? GoogleUserId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateManagerRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? GoogleUserId { get; set; }
        public string? Role { get; set; }
    }

    public class AssignCondoRequest
    {
        public Guid CondoId { get; set; }
    }

    public class CondoDto
    {
        public string Id { get; set; } = string.Empty;
        public string? Name { get; set; }
        public string? Prefix { get; set; }
    }

    #endregion
}
