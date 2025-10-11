using Microsoft.AspNetCore.Mvc;
using aqua.api.Dtos;
using aqua.api.Entities;
using aqua.api.Repositories;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using System.Text.Json;

namespace aqua.api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IDynamoDBContext _context;
        private readonly ILogger<UsersController> _logger;

        public UsersController(IDynamoDBContext context, ILogger<UsersController> logger)
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
                var newUser = new User
                {
                    Id = Guid.NewGuid(),
                    Attribute = $"USER#{request.GoogleUserId}",
                    UserId = request.GoogleUserId,
                    Name = request.Name,
                    Email = request.Email,
                    Unit = request.Unit,
                    Role = request.Role
                };

                await _context.SaveAsync(newUser);

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
                    Id = newUser.Id.ToString(),
                    UserId = newUser.UserId,
                    Name = newUser.Name ?? "",
                    Email = newUser.Email ?? "",
                    Unit = newUser.Unit ?? "",
                    Role = newUser.Role ?? "",
                    CondoId = request.CondoId,
                    CondoName = condo.Name ?? "",
                    CondoPrefix = condo.Prefix ?? ""
                };

                _logger.LogInformation("User provisioned successfully: {UserId}", newUser.Id);

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
        public async Task<ActionResult<UserDto>> GetCurrentUser([FromHeader(Name = "Authorization")] string authHeader, [FromQuery] string? email = null)
        {
            try
            {
                // For development, allow email parameter to check user provisioning
                if (!string.IsNullOrEmpty(email))
                {
                    var userByEmail = await GetUserByEmail(email);
                    if (userByEmail == null)
                    {
                        return NotFound();
                    }
                    return Ok(userByEmail);
                }

                // Extract Google User ID from auth header (in real app, validate JWT token)
                var googleUserId = ExtractGoogleUserIdFromHeader(authHeader);
                if (string.IsNullOrEmpty(googleUserId))
                {
                    return Unauthorized();
                }

                var currentUser = await GetUserByGoogleId(googleUserId);
                if (currentUser == null)
                {
                    return NotFound();
                }

                return Ok(currentUser);
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
            // Scan for user-condo associations since we don't have the Attribute-index
            var userCondoQuery = _context.ScanAsync<User>(new List<ScanCondition>
            {
                new ScanCondition("Attribute", Amazon.DynamoDBv2.DocumentModel.ScanOperator.BeginsWith, $"USERCONDO#{googleUserId}#")
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

        private async Task<UserDto?> GetUserByEmail(string email)
        {
            // First try to find by exact email match
            var userCondoQuery = _context.ScanAsync<User>(new List<ScanCondition>
            {
                new ScanCondition("Email", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, email)
            });

            var userCondos = await userCondoQuery.GetRemainingAsync();
            var userCondo = userCondos.FirstOrDefault();

            // If not found by email, try to find by Google User ID (which might be the Google profile email)
            if (userCondo == null)
            {
                var googleIdQuery = _context.ScanAsync<User>(new List<ScanCondition>
                {
                    new ScanCondition("Attribute", Amazon.DynamoDBv2.DocumentModel.ScanOperator.BeginsWith, $"USERCONDO#{email}#")
                });

                var googleIdCondos = await googleIdQuery.GetRemainingAsync();
                userCondo = googleIdCondos.FirstOrDefault();
            }

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
            if (!Guid.TryParse(condoId, out var condoGuid))
            {
                return null;
            }

            // Use Scan since we don't have the Attribute-index
            var query = _context.ScanAsync<Condo>(new List<ScanCondition>
            {
                new ScanCondition("Id", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, condoGuid),
                new ScanCondition("Attribute", Amazon.DynamoDBv2.DocumentModel.ScanOperator.BeginsWith, "CONDO")
            });

            var condos = await query.GetRemainingAsync();
            return condos.FirstOrDefault();
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
