using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

namespace aqua.api.Middleware
{
    /// <summary>
    /// Middleware for manager authorization and condo context
    /// </summary>
    public class ManagerAuthorizationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ManagerAuthorizationMiddleware> _logger;

        public ManagerAuthorizationMiddleware(RequestDelegate next, ILogger<ManagerAuthorizationMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                // Skip auth for public endpoints
                if (IsPublicEndpoint(context.Request.Path))
                {
                    await _next(context);
                    return;
                }

                // Extract and validate JWT token
                var token = ExtractToken(context.Request);
                if (token == null)
                {
                    _logger.LogWarning("No token found in request to {Path}", context.Request.Path);
                    context.Response.StatusCode = 401;
                    await context.Response.WriteAsync("Unauthorized: No token provided");
                    return;
                }

                // Validate token and extract manager info
                var managerInfo = ValidateManagerToken(token);
                if (managerInfo == null)
                {
                    _logger.LogWarning("Invalid token for request to {Path}", context.Request.Path);
                    context.Response.StatusCode = 401;
                    await context.Response.WriteAsync("Unauthorized: Invalid token");
                    return;
                }

                // Check manager role
                if (managerInfo.Role != "MANAGER")
                {
                    _logger.LogWarning("Non-manager role {Role} attempted to access {Path}", 
                        managerInfo.Role, context.Request.Path);
                    context.Response.StatusCode = 403;
                    await context.Response.WriteAsync("Forbidden: Manager role required");
                    return;
                }

                // Add manager context to request
                context.Items["ManagerId"] = managerInfo.ManagerId;
                context.Items["ManagerEmail"] = managerInfo.Email;
                context.Items["ManagerName"] = managerInfo.Name;
                context.Items["ActiveCondoId"] = managerInfo.ActiveCondoId;

                _logger.LogDebug("Manager {ManagerId} accessing {Path} for condo {CondoId}", 
                    managerInfo.ManagerId, context.Request.Path, managerInfo.ActiveCondoId);

                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ManagerAuthorizationMiddleware");
                context.Response.StatusCode = 500;
                await context.Response.WriteAsync("Internal server error");
            }
        }

        private bool IsPublicEndpoint(PathString path)
        {
            var publicPaths = new[]
            {
                "/api/managerauth/google",
                "/api/managerauth/me",
                "/api/data/",
                "/health",
                "/swagger"
            };

            return publicPaths.Any(p => path.StartsWithSegments(p, StringComparison.OrdinalIgnoreCase));
        }

        private string? ExtractToken(HttpRequest request)
        {
            // Try to get token from Authorization header
            if (request.Headers.TryGetValue("Authorization", out var authHeader))
            {
                var authValue = authHeader.FirstOrDefault();
                if (!string.IsNullOrEmpty(authValue) && authValue.StartsWith("Bearer "))
                {
                    return authValue.Substring(7);
                }
            }

            // Try to get token from query parameter (for development)
            if (request.Query.TryGetValue("token", out var queryToken))
            {
                return queryToken.FirstOrDefault();
            }

            return null;
        }

        private ManagerContext? ValidateManagerToken(string token)
        {
            try
            {
                // In a real implementation, you would validate the JWT token properly
                // For now, we'll do a simplified validation
                
                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadJwtToken(token);

                // Extract claims
                var managerIdClaim = jsonToken.Claims.FirstOrDefault(c => c.Type == "sub" || c.Type == "manager_id");
                var emailClaim = jsonToken.Claims.FirstOrDefault(c => c.Type == "email");
                var nameClaim = jsonToken.Claims.FirstOrDefault(c => c.Type == "name");
                var roleClaim = jsonToken.Claims.FirstOrDefault(c => c.Type == "role");
                var condoIdClaim = jsonToken.Claims.FirstOrDefault(c => c.Type == "active_condo_id");

                if (managerIdClaim == null || emailClaim == null || roleClaim == null)
                {
                    _logger.LogWarning("Missing required claims in token");
                    return null;
                }

                return new ManagerContext
                {
                    ManagerId = managerIdClaim.Value,
                    Email = emailClaim.Value,
                    Name = nameClaim?.Value ?? "Manager",
                    Role = roleClaim.Value,
                    ActiveCondoId = condoIdClaim?.Value
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating manager token");
                return null;
            }
        }
    }

    /// <summary>
    /// Manager context information extracted from JWT token
    /// </summary>
    public class ManagerContext
    {
        public string ManagerId { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? ActiveCondoId { get; set; }
    }
}
