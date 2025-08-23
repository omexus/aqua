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
            logger.LogDebug("GoogleLogin");
            var clientId = "252228382269-imsndvuvdtqfsbc4ecnf8jmf4m98p20a.apps.googleusercontent.com";
            var clientSecret = "yGOCSPX-CMx2JjjfJx_ztxQFeETBAlO1R4Cy";
            var redirectUri = request.RedirectUri ?? "http://localhost:5173/callback";

            try
            {
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
                        logger.LogError("Failed to exchange authorization code for tokens. Status: {Status}", response.StatusCode);
                        return BadRequest(new { success = false, error = "Failed to exchange authorization code for tokens." });
                    }

                    var tokenResponse = await response.Content.ReadAsStringAsync();
                    var tokenData = JsonConvert.DeserializeObject<GoogleTokenResponse>(tokenResponse);

                    if (tokenData == null)
                    {
                        logger.LogError("Failed to deserialize token response");
                        return BadRequest(new { success = false, error = "Failed to process token response." });
                    }

                    // Get user profile from Google
                    var userInfoResponse = await httpClient.GetAsync($"https://www.googleapis.com/oauth2/v1/userinfo?access_token={tokenData.AccessToken}");
                    
                    if (!userInfoResponse.IsSuccessStatusCode)
                    {
                        logger.LogError("Failed to get user info from Google. Status: {Status}", userInfoResponse.StatusCode);
                        return BadRequest(new { success = false, error = "Failed to get user profile from Google." });
                    }

                    var userInfoJson = await userInfoResponse.Content.ReadAsStringAsync();
                    var userInfo = JsonConvert.DeserializeObject<GoogleUserInfo>(userInfoJson);

                    if (userInfo == null)
                    {
                        logger.LogError("Failed to deserialize user info");
                        return BadRequest(new { success = false, error = "Failed to process user profile." });
                    }

                    // Generate a JWT token for the user
                    var jwtToken = JwtTokenGenerator.GenerateToken(userInfo.Id, userInfo.Email, userInfo.Name);

                    // Return success response with user info and token
                    return Ok(new
                    {
                        success = true,
                        token = jwtToken,
                        user = new
                        {
                            id = userInfo.Id,
                            email = userInfo.Email,
                            name = userInfo.Name,
                            picture = userInfo.Picture,
                            googleUserId = userInfo.Id
                        }
                    });
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error during Google OAuth authentication");
                return BadRequest(new { success = false, error = "Authentication failed. Please try again." });
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
    public string Code { get; set; } = string.Empty;
    public string? RedirectUri { get; set; }
}

public class GoogleUserInfo
{
    [JsonProperty("id")]
    public string Id { get; set; } = string.Empty;

    [JsonProperty("email")]
    public string Email { get; set; } = string.Empty;

    [JsonProperty("verified_email")]
    public bool VerifiedEmail { get; set; }

    [JsonProperty("name")]
    public string Name { get; set; } = string.Empty;

    [JsonProperty("given_name")]
    public string GivenName { get; set; } = string.Empty;

    [JsonProperty("family_name")]
    public string FamilyName { get; set; } = string.Empty;

    [JsonProperty("picture")]
    public string Picture { get; set; } = string.Empty;

    [JsonProperty("locale")]
    public string Locale { get; set; } = string.Empty;
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