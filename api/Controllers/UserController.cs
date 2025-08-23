using Microsoft.AspNetCore.Mvc;
using aqua.api.Dtos;
using aqua.api.Entities;
using aqua.api.Repositories;
using Amazon.DynamoDBv2.DataModel;
using System.Text.Json;

namespace aqua.api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IDynamoDBContext _context;
        private readonly ILogger<UserController> _logger;

        public UserController(IDynamoDBContext context, ILogger<UserController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost("provision")]
        public async Task<ActionResult<UserProvisionResponse>> ProvisionUser([FromBody] UserProvisionRequest request)
        {
            try
            {
                _logger.LogInformation("Provisioning user: {Email} for condo: {CondoId}", request.Email, request.CondoId);

                // Check if user already exists
                var existingUser = await GetUserByGoogleId(request.GoogleUserId);
                if (existingUser != null)
                {
                    return Ok(new UserProvisionResponse
                    {
                        Success = true,
                        User = existingUser,
                        Error = "User already exists"
                    });
                }

                // Get condo information
                var condo = await GetCondoById(request.CondoId);
                if (condo == null)
                {
                    return BadRequest(new UserProvisionResponse
                    {
                        Success = false,
                        Error = "Condo not found"
                    });
                }

                // Create new user
                var user = new User
                {
                    Id = Guid.NewGuid(),
                    Attribute = $"USER#{request.GoogleUserId}",
                    UserId = request.GoogleUserId,
                    Name = request.Name,
                    Email = request.Email,
                    Unit = request.Unit,
                    Role = request.Role
                };

                await _context.SaveAsync(user);

                // Create user-condo association
                var userCondo = new User
                {
                    Id = Guid.NewGuid(),
                    Attribute = $"USERCONDO#{request.GoogleUserId}#{request.CondoId}",
                    UserId = request.GoogleUserId,
                    Name = request.Name,
                    Email = request.Email,
                    Unit = request.Unit,
                    Role = request.Role
                };

                await _context.SaveAsync(userCondo);

                var userDto = new UserDto
                {
                    Id = user.Id.ToString(),
                    UserId = user.UserId,
                    Name = user.Name ?? "",
                    Email = user.Email ?? "",
                    Unit = user.Unit ?? "",
                    Role = user.Role ?? "",
                    CondoId = request.CondoId,
                    CondoName = condo.Name ?? "",
                    CondoPrefix = condo.Prefix ?? ""
                };

                _logger.LogInformation("User provisioned successfully: {UserId}", user.Id);

                return Ok(new UserProvisionResponse
                {
                    Success = true,
                    User = userDto
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error provisioning user: {Email}", request.Email);
                return StatusCode(500, new UserProvisionResponse
                {
                    Success = false,
                    Error = "Internal server error"
                });
            }
        }

        [HttpGet("me")]
        public async Task<ActionResult<UserDto>> GetCurrentUser([FromHeader(Name = "Authorization")] string authHeader)
        {
            try
            {
                // Extract Google User ID from auth header (in real app, validate JWT token)
                var googleUserId = ExtractGoogleUserIdFromHeader(authHeader);
                if (string.IsNullOrEmpty(googleUserId))
                {
                    return Unauthorized();
                }

                var user = await GetUserByGoogleId(googleUserId);
                if (user == null)
                {
                    return NotFound();
                }

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current user");
                return StatusCode(500);
            }
        }

        [HttpGet("condos")]
        public async Task<ActionResult<List<CondoDto>>> GetAvailableCondos()
        {
            try
            {
                var condos = await GetAllCondos();
                return Ok(condos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting available condos");
                return StatusCode(500);
            }
        }

        private async Task<UserDto?> GetUserByGoogleId(string googleUserId)
        {
            var userCondoQuery = _context.QueryAsync<User>($"USERCONDO#{googleUserId}#", new DynamoDBOperationConfig
            {
                IndexName = "Attribute-index"
            });

            var userCondos = await userCondoQuery.GetRemainingAsync();
            var userCondo = userCondos.FirstOrDefault();

            if (userCondo == null) return null;

            // Get condo information
            var condo = await GetCondoById(userCondo.Attribute.Split('#')[2]);
            if (condo == null) return null;

            return new UserDto
            {
                Id = userCondo.Id.ToString(),
                UserId = userCondo.UserId,
                Name = userCondo.Name ?? "",
                Email = userCondo.Email ?? "",
                Unit = userCondo.Unit ?? "",
                Role = userCondo.Role ?? "",
                CondoId = condo.Id.ToString(),
                CondoName = condo.Name ?? "",
                CondoPrefix = condo.Prefix ?? ""
            };
        }

        private async Task<Condo?> GetCondoById(string condoId)
        {
            var query = _context.QueryAsync<Condo>(condoId, new DynamoDBOperationConfig
            {
                IndexName = "Id-index"
            });

            var condos = await query.GetRemainingAsync();
            return condos.FirstOrDefault(c => c.Attribute.StartsWith("CONDO#"));
        }

        private async Task<List<CondoDto>> GetAllCondos()
        {
            var query = _context.ScanAsync<Condo>(new List<ScanCondition>
            {
                new ScanCondition("Attribute", Amazon.DynamoDBv2.DocumentModel.ScanOperator.BeginsWith, "CONDO#")
            });

            var condos = await query.GetRemainingAsync();
            return condos.Select(c => new CondoDto
            {
                Id = c.Id.ToString(),
                Name = c.Name ?? "",
                Prefix = c.Prefix ?? ""
            }).ToList();
        }

        private string? ExtractGoogleUserIdFromHeader(string authHeader)
        {
            // In a real implementation, you would validate the JWT token
            // and extract the Google User ID from it
            // For now, we'll use a simple approach for development
            
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                return null;
            }

            var token = authHeader.Substring("Bearer ".Length);
            
            // For development, assume the token contains the Google User ID
            // In production, you would decode and validate the JWT token
            return token;
        }
    }
}
