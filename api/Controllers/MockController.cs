using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using aqua.api.Dtos;

namespace aqua.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MockController : ControllerBase
    {
        // Define the available condos
        private static readonly Dictionary<string, aqua.api.Dtos.CondoDto> Condos = new()
        {
            ["a2f02fa1-bbe4-46f8-90be-4aa43162400c"] = new aqua.api.Dtos.CondoDto
            {
                Id = "a2f02fa1-bbe4-46f8-90be-4aa43162400c",
                Name = "Aqua Condominium",
                Prefix = "AQUA"
            },
            ["b3f13fa2-cce5-47f9-91cf-5bb54273511d"] = new aqua.api.Dtos.CondoDto
            {
                Id = "b3f13fa2-cce5-47f9-91cf-5bb54273511d",
                Name = "Marina Towers",
                Prefix = "MARINA"
            },
            ["c4f24fa3-ddf6-48fa-92df-6cc65384622e"] = new aqua.api.Dtos.CondoDto
            {
                Id = "c4f24fa3-ddf6-48fa-92df-6cc65384622e",
                Name = "Sunset Heights",
                Prefix = "SUNSET"
            }
        };

        // Mock user-tenant mapping (in real app, this would come from database)
        private static readonly Dictionary<string, string> UserTenantMapping = new()
        {
            ["john.doe@aqua.com"] = "a2f02fa1-bbe4-46f8-90be-4aa43162400c",
            ["jane.smith@aqua.com"] = "a2f02fa1-bbe4-46f8-90be-4aa43162400c",
            ["bob.johnson@aqua.com"] = "a2f02fa1-bbe4-46f8-90be-4aa43162400c",
            ["alice.brown@marina.com"] = "b3f13fa2-cce5-47f9-91cf-5bb54273511d",
            ["charlie.wilson@marina.com"] = "b3f13fa2-cce5-47f9-91cf-5bb54273511d",
            ["diana.garcia@sunset.com"] = "c4f24fa3-ddf6-48fa-92df-6cc65384622e",
            ["john.manager@aqua.com"] = "a2f02fa1-bbe4-46f8-90be-4aa43162400c",
            ["hl.morales@gmail.com"] = "a2f02fa1-bbe4-46f8-90be-4aa43162400c",
        };

        [HttpPost("auth/mock-login")]
        [Microsoft.AspNetCore.Authorization.AllowAnonymous]
        public ActionResult<object> MockLogin([FromBody] MockLoginRequest request)
        {
            if (UserTenantMapping.TryGetValue(request.Email, out var tenantId))
            {
                var condo = Condos[tenantId];
                return Ok(new
                {
                    success = true,
                    user = new
                    {
                        email = request.Email,
                        name = request.Email.Split('@')[0].Replace('.', ' '),
                        tenantId = tenantId,
                        condoName = condo.Name,
                        condoPrefix = condo.Prefix
                    },
                    token = $"mock-jwt-token-{Guid.NewGuid()}"
                });
            }

            return Unauthorized(new { success = false, message = "Invalid credentials" });
        }

        [HttpGet("auth/me")]
        public ActionResult<object> GetCurrentUser([FromHeader(Name = "Authorization")] string authHeader)
        {
            // In a real app, you'd validate the JWT token here
            // For mock purposes, we'll return a default user
            var defaultEmail = "john.doe@aqua.com";
            var tenantId = UserTenantMapping[defaultEmail];
            var condo = Condos[tenantId];

            return Ok(new
            {
                email = defaultEmail,
                name = "John Doe",
                tenantId = tenantId,
                condoName = condo.Name,
                condoPrefix = condo.Prefix
            });
        }

        [HttpGet("periods/{id}")]
        public ActionResult<IEnumerable<PeriodDto>> GetPeriods(string id, int limit = 10)
        {
            if (!Condos.ContainsKey(id))
            {
                return NotFound($"Condo with ID {id} not found");
            }

            var condo = Condos[id];
            var periods = new List<PeriodDto>();

            switch (condo.Prefix)
            {
                case "AQUA":
                    periods.AddRange(new[]
                    {
                        new PeriodDto
                        {
                            Id = "period-aqua-jan",
                            From = "2024-01-01",
                            To = "2024-01-31",
                            Prefix = "AQUA",
                            Generated = 0,
                            Amount = 1500.00
                        },
                        new PeriodDto
                        {
                            Id = "period-aqua-feb",
                            From = "2024-02-01",
                            To = "2024-02-29",
                            Prefix = "AQUA",
                            Generated = 0,
                            Amount = 1500.00
                        }
                    });
                    break;

                case "MARINA":
                    periods.AddRange(new[]
                    {
                        new PeriodDto
                        {
                            Id = "period-marina-jan",
                            From = "2024-01-01",
                            To = "2024-01-31",
                            Prefix = "MARINA",
                            Generated = 0,
                            Amount = 2000.00
                        }
                    });
                    break;

                case "SUNSET":
                    periods.AddRange(new[]
                    {
                        new PeriodDto
                        {
                            Id = "period-sunset-jan",
                            From = "2024-01-01",
                            To = "2024-01-31",
                            Prefix = "SUNSET",
                            Generated = 0,
                            Amount = 1800.00
                        }
                    });
                    break;
            }

            return Ok(periods);
        }

        [HttpGet("units/{id}")]
        public ActionResult<IEnumerable<UnitDto>> GetUnits(string id)
        {
            if (!Condos.ContainsKey(id))
            {
                return NotFound($"Condo with ID {id} not found");
            }

            var condo = Condos[id];
            var units = new List<UnitDto>();

            switch (condo.Prefix)
            {
                case "AQUA":
                    units.AddRange(new[]
                    {
                        new UnitDto
                        {
                            Id = "unit-aqua-101",
                            UserId = "john.doe@aqua.com",
                            Name = "John Doe",
                            Email = "john.doe@aqua.com",
                            Unit = "101",
                            Role = "Owner"
                        },
                        new UnitDto
                        {
                            Id = "unit-aqua-102",
                            UserId = "jane.smith@aqua.com",
                            Name = "Jane Smith",
                            Email = "jane.smith@aqua.com",
                            Unit = "102",
                            Role = "Tenant"
                        },
                        new UnitDto
                        {
                            Id = "unit-aqua-201",
                            UserId = "bob.johnson@aqua.com",
                            Name = "Bob Johnson",
                            Email = "bob.johnson@aqua.com",
                            Unit = "201",
                            Role = "Owner"
                        }
                    });
                    break;

                case "MARINA":
                    units.AddRange(new[]
                    {
                        new UnitDto
                        {
                            Id = "unit-marina-a1",
                            UserId = "alice.brown@marina.com",
                            Name = "Alice Brown",
                            Email = "alice.brown@marina.com",
                            Unit = "A1",
                            Role = "Owner"
                        },
                        new UnitDto
                        {
                            Id = "unit-marina-a2",
                            UserId = "charlie.wilson@marina.com",
                            Name = "Charlie Wilson",
                            Email = "charlie.wilson@marina.com",
                            Unit = "A2",
                            Role = "Tenant"
                        }
                    });
                    break;

                case "SUNSET":
                    units.AddRange(new[]
                    {
                        new UnitDto
                        {
                            Id = "unit-sunset-s1",
                            UserId = "diana.garcia@sunset.com",
                            Name = "Diana Garcia",
                            Email = "diana.garcia@sunset.com",
                            Unit = "S1",
                            Role = "Owner"
                        }
                    });
                    break;
            }

            return Ok(units);
        }

        [HttpGet("condos/{id}")]
        public ActionResult<aqua.api.Dtos.CondoDto> GetCondo(string id)
        {
            if (!Condos.ContainsKey(id))
            {
                return NotFound($"Condo with ID {id} not found");
            }

            return Ok(Condos[id]);
        }

        [HttpPost("periods/{id}")]
        public ActionResult<PeriodDto> SavePeriod(string id, [FromBody] object request)
        {
            if (!Condos.ContainsKey(id))
            {
                return NotFound($"Condo with ID {id} not found");
            }

            var condo = Condos[id];
            var period = new PeriodDto
            {
                Id = $"period-{condo.Prefix.ToLower()}-{DateTime.Now:yyyyMMdd-HHmmss}",
                From = DateTime.Now.AddMonths(-1).ToString("yyyy-MM-dd"),
                To = DateTime.Now.ToString("yyyy-MM-dd"),
                Prefix = condo.Prefix,
                Generated = 0,
                Amount = condo.Prefix switch
                {
                    "AQUA" => 1500.00,
                    "MARINA" => 2000.00,
                    "SUNSET" => 1800.00,
                    _ => 1500.00
                }
            };

            return Ok(period);
        }

        // Mock user provisioning endpoints
        [HttpPost("users/provision")]
        public ActionResult<object> ProvisionUser([FromBody] MockUserProvisionRequest request)
        {
            // Check if user already exists
            if (UserTenantMapping.ContainsKey(request.Email))
            {
                var existingTenantId = UserTenantMapping[request.Email];
                var existingCondo = Condos[existingTenantId];
                
                return Ok(new
                {
                    success = true,
                    user = new
                    {
                        id = Guid.NewGuid().ToString(),
                        userId = request.GoogleUserId,
                        name = request.Name,
                        email = request.Email,
                        unit = request.Unit,
                        role = request.Role,
                        condoId = existingTenantId,
                        condoName = existingCondo.Name,
                        condoPrefix = existingCondo.Prefix
                    },
                    error = "User already exists"
                });
            }

            // Validate condo exists
            if (!Condos.ContainsKey(request.CondoId))
            {
                return BadRequest(new
                {
                    success = false,
                    error = "Condo not found"
                });
            }

            var condo = Condos[request.CondoId];
            
            // Add user to tenant mapping
            UserTenantMapping[request.Email] = request.CondoId;

            return Ok(new
            {
                success = true,
                user = new
                {
                    id = Guid.NewGuid().ToString(),
                    userId = request.GoogleUserId,
                    name = request.Name,
                    email = request.Email,
                    unit = request.Unit,
                    role = request.Role,
                    condoId = request.CondoId,
                    condoName = condo.Name,
                    condoPrefix = condo.Prefix
                }
            });
        }

        [HttpGet("users/me")]
        public ActionResult<object> GetCurrentUserProfile([FromHeader(Name = "Authorization")] string authHeader)
        {
            // For mock purposes, return a default user
            var defaultEmail = "john.doe@aqua.com";
            var tenantId = UserTenantMapping[defaultEmail];
            var condo = Condos[tenantId];

            return Ok(new
            {
                id = Guid.NewGuid().ToString(),
                userId = "mock-google-user-id",
                name = "John Doe",
                email = defaultEmail,
                unit = "101",
                role = "Owner",
                condoId = tenantId,
                condoName = condo.Name,
                condoPrefix = condo.Prefix
            });
        }

        [HttpGet("users/condos")]
        public ActionResult<List<aqua.api.Dtos.CondoDto>> GetAvailableCondos()
        {
            return Ok(Condos.Values.ToList());
        }

        [HttpPost("condos")]
        public ActionResult<CondoCreateResponse> CreateCondo([FromBody] CondoCreateRequest request)
        {
            try
            {
                // Generate a new condo ID
                var newCondoId = Guid.NewGuid().ToString();
                
                // Create the new condo
                var newCondo = new aqua.api.Dtos.CondoDto
                {
                    Id = newCondoId,
                    Name = request.Name,
                    Prefix = request.Prefix
                };
                
                // Add to the mock condos dictionary
                Condos[newCondoId] = newCondo;
                
                return Ok(new CondoCreateResponse
                {
                    Success = true,
                    Condo = newCondo
                });
            }
            catch (Exception ex)
            {
                return Ok(new CondoCreateResponse
                {
                    Success = false,
                    Error = ex.Message
                });
            }
        }

        [HttpGet("users/test")]
        public ActionResult<string> TestUserEndpoint()
        {
            return Ok("User endpoints are working!");
        }
    }

    public class MockLoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class MockUserProvisionRequest
    {
        public string GoogleUserId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string CondoId { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
