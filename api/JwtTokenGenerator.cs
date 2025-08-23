using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace aqua.api;

public class JwtTokenGenerator
{
    private readonly string _secretKey;
    private readonly string _issuer;
    private readonly string _audience;

    public JwtTokenGenerator(string secretKey, string issuer, string audience)
    {
        _secretKey = secretKey;
        _issuer = issuer;
        _audience = audience;
    }

    public string GenerateJwtToken(AuthUser user)
    {
        // Define the token handler
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_secretKey);

        // Define token claims (user-specific information included in the token)
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()), // Subject, typically the user ID
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), // Unique identifier for the token
            new Claim(ClaimTypes.Role, user.Role) // Add any custom claims (e.g., user role)
        };

        // Create signing credentials using the secret key
        var credentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature);

        // Create the JWT token descriptor (validity period, issuer, audience, claims, etc.)
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(1), // Set expiration (1 hour in this case)
            Issuer = _issuer,  // Set the token issuer
            Audience = _audience, // Set the token audience
            SigningCredentials = credentials
        };

        // Create the token
        var token = tokenHandler.CreateToken(tokenDescriptor);

        // Return the serialized token (JWT string)
        return tokenHandler.WriteToken(token);
    }
}
