using System;

namespace aqua.api;

using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;

public class JwtTokenValidator
{
    private static readonly HttpClient _httpClient = new HttpClient();

    // Synchronously return the signing keys after fetching from JWKS
    public static SecurityKey[] GetSigningKeys(string jwksUrl)
    {
        // Use HttpClient to synchronously retrieve the JWKS (JSON Web Key Set) data
        var response = _httpClient.GetStringAsync(jwksUrl).Result;

        // Parse the JSON Web Key Set (JWKS) from the response
        var jwks = JsonConvert.DeserializeObject<JsonWebKeySet>(response);

        // Return the array of security keys
        return jwks.Keys.ToArray();
    }
}