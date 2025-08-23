using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Google.Apis.Auth;
using Amazon.CognitoIdentityProvider;
using Amazon.Extensions.CognitoAuthentication;
using Amazon.CognitoIdentity;
using Amazon.CognitoIdentity.Model;
using Microsoft.Extensions.Options;
using Amazon.CognitoIdentityProvider.Model;
using Newtonsoft.Json;

namespace aqua.api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAmazonCognitoIdentityProvider _cognitoProvider;
        private readonly ILogger<AuthController> logger;
        private readonly CognitoUserPool _pool;
        private readonly AppConfig _appSettings;

        private const string GoogleClientId = "your-google-client-id";
        private const string CognitoIdentityPoolId = "your-cognito-identity-pool-id";
        // private readonly IAmazonCognitoIdentity _cognitoClient;

        // public AuthController(IAmazonCognitoIdentity cognitoClient)
        // {
        //     _cognitoClient = cognitoClient;
        // }
        /// <summary>
        /// Constructor. Read from configuration.   
        /// </summary>
        /// <param name="cognitoProvider"></param>
        public AuthController(IAmazonCognitoIdentityProvider cognitoProvider, IOptions<AppConfig> appSettings, ILogger<AuthController> logger)
        {
            _cognitoProvider = cognitoProvider;
            this.logger = logger;
            _appSettings = appSettings.Value;
            _pool = new CognitoUserPool(_appSettings.Cognito.UserPoolId, _appSettings.Cognito.ClientId, cognitoProvider);

        }

        // [HttpPost("google")]
        // public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
        // {
        //     var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken);
        //     if (payload == null) return Unauthorized();

        //     // Assuming user validation with Cognito
        //     var user = new CognitoUser(payload.Subject, "your-client-id", _pool, _cognitoProvider);

        //     var token = GenerateJwtToken(user);
        //     return Ok(new { Token = token });
        // }

        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
        {
            // Console.WriteLine("GoogleLogin");
            logger.LogDebug("GoogleLogin");
            var clientId = "252228382269-imsndvuvdtqfsbc4ecnf8jmf4m98p20a.apps.googleusercontent.com";
            var clientSecret = "yGOCSPX-CMx2JjjfJx_ztxQFeETBAlO1R4Cy";
            var redirectUri = "http://localhost:5173/callback";  // The URI to which Google redirected the user after authentication

            // Exchange authorization code for tokens
            using (var httpClient = new HttpClient())
            {
                var tokenRequest = new Dictionary<string, string>
        {
            { "code", request.Code },
            { "client_id", clientId },
            { "client_secret", clientSecret },
            { "redirect_uri", redirectUri },
            { "grant_type", "authorization_code" }
        };

                var content = new FormUrlEncodedContent(tokenRequest);
                var response = await httpClient.PostAsync("https://oauth2.googleapis.com/token", content);

                if (!response.IsSuccessStatusCode)
                {
                    return BadRequest("Failed to exchange authorization code for tokens.");
                }

                var tokenResponse = await response.Content.ReadAsStringAsync();
                var tokenData = JsonConvert.DeserializeObject<GoogleTokenResponse>(tokenResponse);

                if (tokenData == null)
                {
                    return BadRequest("Failed to exchange authorization code for tokens.");
                }

                // Return tokens to client
                return Ok(new
                {
                    tokenData?.AccessToken,
                    tokenData?.RefreshToken,
                    tokenData?.IdToken,
                });
            }
        }

        // private async Task<Credentials> GetCognitoCredentials(string googleUserId, string googleIdToken)
        // {
        //     var getIdRequest = new GetIdRequest
        //     {
        //         IdentityPoolId = CognitoIdentityPoolId,
        //         Logins = new Dictionary<string, string>
        //     {
        //         { "accounts.google.com", googleIdToken }
        //     }
        //     };

        //     // Step 1: Get Identity ID from Cognito
        //     var getIdResponse = await _cognitoClient.GetIdAsync(getIdRequest);

        //     // Step 2: Get Cognito credentials (Access Key, Secret Key, Session Token) using the Identity ID
        //     var getCredentialsRequest = new GetCredentialsForIdentityRequest
        //     {
        //         IdentityId = getIdResponse.IdentityId,
        //         Logins = new Dictionary<string, string>
        //     {
        //         { "accounts.google.com", googleIdToken }
        //     }
        //     };

        //     var credentialsResponse = await _cognitoClient.GetCredentialsForIdentityAsync(getCredentialsRequest);
        //     return credentialsResponse.Credentials;
        // }

        // private string GenerateJwtToken(CognitoUser user)
        // {
        //     // Generate JWT token logic here
        //     return "your-generated-jwt-token";
        // }
    }
}

public class GoogleLoginRequest
{
    public string Code { get; set; }
}

public class GoogleTokenResponse
{
    [JsonProperty("access_token")]
    public string AccessToken { get; set; }

    [JsonProperty("refresh_token")]
    public string RefreshToken { get; set; }

    [JsonProperty("id_token")]
    public string IdToken { get; set; }
}