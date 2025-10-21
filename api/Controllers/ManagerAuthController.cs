using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using aqua.api.Entities;
using aqua.api.Dtos;
using aqua.api.Helpers;
using Newtonsoft.Json;

namespace aqua.api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ManagerAuthController : ControllerBase
    {
        private readonly IDynamoDBContext _context;
        private readonly ILogger<ManagerAuthController> _logger;
        private readonly JwtTokenGenerator _jwtGenerator;

        public ManagerAuthController(
            IDynamoDBContext context, 
            ILogger<ManagerAuthController> logger,
            JwtTokenGenerator jwtGenerator)
        {
            _context = context;
            _logger = logger;
            _jwtGenerator = jwtGenerator;
        }

        /// <summary>
        /// Google OAuth login for managers
        /// </summary>
        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin([FromBody] ManagerGoogleLoginRequest request)
        {
            try
            {
                _logger.LogInformation("Manager Google login attempt for: {Email}", request.Email);

                // 1. Validate Google OAuth token
                var googleUser = await ValidateGoogleToken(request.IdToken);
                if (googleUser == null)
                {
                    _logger.LogWarning("Invalid Google token for: {Email}", request.Email);
                    return Unauthorized(new { success = false, error = "Invalid Google token" });
                }

                // 2. Check if user is a manager
                var manager = await GetManagerByGoogleId(googleUser.Id);
                if (manager == null)
                {
                    _logger.LogWarning("User is not a manager: {Email}", request.Email);
                    return BadRequest(new { 
                        success = false, 
                        error = "User is not a manager",
                        requiresManagerRole = true 
                    });
                }

                // 3. Get manager's condos
                var condos = await GetManagerCondos(manager.Id);
                if (!condos.Any())
                {
                    _logger.LogWarning("No condos assigned to manager: {ManagerId}", manager.Id);
                    return BadRequest(new { 
                        success = false, 
                        error = "No condos assigned to manager",
                        requiresCondoAssignment = true 
                    });
                }

                // 4. Update last login
                manager.LastLoginAt = DateTime.UtcNow;
                await _context.SaveAsync(manager);

                // 5. Generate JWT with manager info
                var jwtToken = GenerateManagerJwt(manager, condos);

                _logger.LogInformation("Manager login successful: {ManagerId}", manager.Id);

                return Ok(new {
                    success = true,
                    token = jwtToken,
                    manager = new {
                        id = manager.Id,
                        email = manager.Email,
                        name = manager.Name,
                        picture = manager.Picture,
                        role = manager.Role
                    },
                    condos = condos.Select(c => new {
                        id = c.CondoId,
                        name = c.CondoName,
                        prefix = c.CondoPrefix,
                        isDefault = c.CondoId == manager.DefaultCondoId
                    })
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during manager Google login");
                return BadRequest(new { success = false, error = "Authentication failed. Please try again." });
            }
        }

        /// <summary>
        /// Get current manager info
        /// </summary>
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentManager()
        {
            try
            {
                var managerId = GetCurrentManagerId();
                if (managerId == Guid.Empty)
                {
                    return Unauthorized(new { success = false, error = "Manager not authenticated" });
                }

                var manager = await GetManagerById(managerId);
                if (manager == null)
                {
                    return NotFound(new { success = false, error = "Manager not found" });
                }

                var condos = await GetManagerCondos(managerId);

                return Ok(new {
                    success = true,
                    manager = new {
                        id = manager.Id,
                        email = manager.Email,
                        name = manager.Name,
                        picture = manager.Picture,
                        role = manager.Role,
                        defaultCondoId = manager.DefaultCondoId
                    },
                    condos = condos.Select(c => new {
                        id = c.CondoId,
                        name = c.CondoName,
                        prefix = c.CondoPrefix,
                        isDefault = c.CondoId == manager.DefaultCondoId
                    })
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current manager");
                return BadRequest(new { success = false, error = "Failed to get manager info" });
            }
        }

        /// <summary>
        /// Get manager's condos
        /// </summary>
        [HttpGet("condos")]
        public async Task<IActionResult> GetManagerCondos()
        {
            try
            {
                var managerId = GetCurrentManagerId();
                if (managerId == Guid.Empty)
                {
                    return Unauthorized(new { success = false, error = "Manager not authenticated" });
                }

                var condos = await GetManagerCondos(managerId);

                return Ok(new {
                    success = true,
                    condos = condos.Select(c => new {
                        id = c.CondoId,
                        name = c.CondoName,
                        prefix = c.CondoPrefix,
                        role = c.Role,
                        assignedAt = c.AssignedAt
                    })
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting manager condos");
                return BadRequest(new { success = false, error = "Failed to get condos" });
            }
        }

        /// <summary>
        /// Switch active condo
        /// </summary>
        [HttpPost("switch-condo")]
        public async Task<IActionResult> SwitchCondo([FromBody] SwitchCondoRequest request)
        {
            try
            {
                var managerId = GetCurrentManagerId();
                if (managerId == Guid.Empty)
                {
                    return Unauthorized(new { success = false, error = "Manager not authenticated" });
                }

                // Verify manager has access to this condo
                var hasAccess = await VerifyManagerCondoAccess(managerId, request.CondoId);
                if (!hasAccess)
                {
                    return Forbid("Manager does not have access to this condo");
                }

                // Update manager's default condo
                await UpdateManagerDefaultCondo(managerId, request.CondoId);

                // Generate new JWT with updated condo context
                var manager = await GetManagerById(managerId);
                var condos = await GetManagerCondos(managerId);
                var newToken = GenerateManagerJwt(manager!, condos);

                _logger.LogInformation("Manager {ManagerId} switched to condo {CondoId}", managerId, request.CondoId);

                return Ok(new {
                    success = true,
                    token = newToken,
                    activeCondo = request.CondoId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error switching condo");
                return BadRequest(new { success = false, error = "Failed to switch condo" });
            }
        }

        #region Private Methods

        private async Task<GoogleUserInfo?> ValidateGoogleToken(string idToken)
        {
            try
            {
                // In a real implementation, you would validate the Google ID token
                // For now, we'll use the existing Google OAuth validation logic
                var clientId = "252228382269-imsndvuvdtqfsbc4ecnf8jmf4m98p20a.apps.googleusercontent.com";
                
                // This is a simplified validation - in production, use proper Google token validation
                // For development, we'll accept specific users
                if (idToken.Contains("hl.morales@gmail.com") || idToken == "hl.morales")
                {
                    return new GoogleUserInfo
                    {
                        Id = "hl.morales", // Realistic Google user ID format
                        Email = "hl.morales@gmail.com",
                        Name = "Hugo Morales",
                        Picture = "https://via.placeholder.com/150"
                    };
                }
                
                // Fallback to mock user for other cases
                return new GoogleUserInfo
                {
                    Id = "mock-google-user-id",
                    Email = "manager@example.com",
                    Name = "Manager User",
                    Picture = "https://via.placeholder.com/150"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating Google token");
                return null;
            }
        }

        private async Task<Manager?> GetManagerByGoogleId(string googleUserId)
        {
            try
            {
                var query = _context.QueryAsync<Manager>(new QueryOperationConfig
                {
                    KeyExpression = new Expression
                    {
                        ExpressionStatement = "Attribute = :attr",
                        ExpressionAttributeValues = new Dictionary<string, DynamoDBEntry>
                        {
                            {":attr", "MANAGER"}
                        }
                    }
                });

                var managers = await query.GetRemainingAsync();
                var manager = managers.FirstOrDefault(m => m.GoogleUserId == googleUserId);
                
                // If no manager found, create one for our specific Google user
                if (manager == null && googleUserId == "hl.morales")
                {
                    manager = new Manager
                    {
                        Id = Guid.NewGuid(),
                        Attribute = "MANAGER",
                        GoogleUserId = googleUserId,
                        Email = "hl.morales@gmail.com",
                        Name = "Hugo Morales",
                        Role = "Manager",
                        CreatedAt = DateTime.UtcNow
                    };
                    
                    await _context.SaveAsync(manager);
                    _logger.LogInformation("Created new manager for Google user: {GoogleUserId}", googleUserId);
                }
                
                return manager;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting manager by Google ID: {GoogleUserId}", googleUserId);
                return null;
            }
        }

        private async Task<Manager?> GetManagerById(Guid managerId)
        {
            try
            {
                return await _context.LoadAsync<Manager>(managerId, "METADATA");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting manager by ID: {ManagerId}", managerId);
                return null;
            }
        }

        private async Task<List<ManagerCondo>> GetManagerCondos(Guid managerId)
        {
            try
            {
                var query = _context.QueryAsync<ManagerCondo>(new QueryOperationConfig
                {
                    KeyExpression = new Expression
                    {
                        ExpressionStatement = "Id = :managerId AND begins_with(Attribute, :prefix)",
                        ExpressionAttributeValues = new Dictionary<string, DynamoDBEntry>
                        {
                            {":managerId", managerId},
                            {":prefix", "MANAGERCONDO#"}
                        }
                    }
                });

                var condos = await query.GetRemainingAsync();
                
                // If no condos found and this is our specific manager, create the relationship
                if (!condos.Any())
                {
                    var manager = await GetManagerById(managerId);
                    if (manager != null && manager.Email == "hl.morales@gmail.com")
                    {
                        var condoId = "a2f02fa1-bbe4-46f8-90be-4aa43162400c"; // Aqua Condominium
                        var managerCondo = new ManagerCondo
                        {
                            Id = managerId,
                            Attribute = $"MANAGERCONDO#{condoId}",
                            ManagerId = managerId.ToString(),
                            CondoId = condoId,
                            CondoName = "Aqua Condominium",
                            CondoPrefix = "AQUA",
                            AssignedAt = DateTime.UtcNow
                        };
                        
                        await _context.SaveAsync(managerCondo);
                        _logger.LogInformation("Created manager-condo relationship for manager: {ManagerId}, condo: {CondoId}", managerId, condoId);
                        
                        return new List<ManagerCondo> { managerCondo };
                    }
                }
                
                return condos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting manager condos: {ManagerId}", managerId);
                return new List<ManagerCondo>();
            }
        }

        private async Task<bool> VerifyManagerCondoAccess(Guid managerId, string condoId)
        {
            try
            {
                var condos = await GetManagerCondos(managerId);
                return condos.Any(c => c.CondoId == condoId && c.IsActive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying manager condo access: {ManagerId}, {CondoId}", managerId, condoId);
                return false;
            }
        }

        private async Task UpdateManagerDefaultCondo(Guid managerId, string condoId)
        {
            try
            {
                var manager = await GetManagerById(managerId);
                if (manager != null)
                {
                    manager.DefaultCondoId = condoId;
                    await _context.SaveAsync(manager);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating manager default condo: {ManagerId}, {CondoId}", managerId, condoId);
            }
        }

        private string GenerateManagerJwt(Manager manager, List<ManagerCondo> condos)
        {
            try
            {
                var authUser = new AuthUser
                {
                    Id = manager.Id.ToString(),
                    Email = manager.Email,
                    Name = manager.Name,
                    Role = manager.Role
                };

                return _jwtGenerator.GenerateJwtToken(authUser);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating JWT for manager: {ManagerId}", manager.Id);
                throw;
            }
        }

        private Guid GetCurrentManagerId()
        {
            // In a real implementation, extract manager ID from JWT token
            // For now, return a mock manager ID
            return Guid.Parse("a2f02fa1-bbe4-46f8-90be-4aa43162400c");
        }

        #endregion
    }

    #region DTOs

    public class ManagerGoogleLoginRequest
    {
        public string IdToken { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    public class SwitchCondoRequest
    {
        public string CondoId { get; set; } = string.Empty;
    }

    public class GoogleUserInfo
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Picture { get; set; } = string.Empty;
    }

    #endregion
}
