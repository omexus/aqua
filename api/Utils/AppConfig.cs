namespace aqua.api;

public class AppConfig
{
    public required S3Definition S3 { get; set; }
    public required DbDefinition Database { get; set; }
    public required CognitoDefinition Cognito { get; set; }

}

public class CognitoDefinition
{
    public  string UserPoolId { get; set; }
    public  string ClientId { get; set; }
    public  string IdentityPoolId { get; set; }
    public  string GoogleClientId { get; set; }
    public  string Region { get; set; }
    public  string JwksUrl { get; set; }
}

public class S3Definition {
    public  string BucketName { get; set; }
}

public class DbDefinition {
    public  string TableName { get; set;} 
}
