using System.Text.Json;
using aqua.api.Repositories;
using Amazon;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.S3;
using aqua.api.Utils;
using aqua.api.Entities;
using FluentValidation;
using aqua.api.Validators;
using SharpGrip.FluentValidation.AutoValidation.Mvc.Extensions;
using Amazon.SimpleEmailV2;
using Amazon.Extensions.NETCore.Setup;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Amazon.CognitoIdentityProvider;
using aqua.api.Services;
using aqua.api.Middleware;
namespace aqua.api;

public class Startup
{
    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public IConfiguration Configuration { get; }

    // This method gets called by the runtime. Use this method to add services to the container
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddLogging(builder =>
        {
            builder.AddConsole();
            builder.AddDebug();
        });
        
        services.AddCors(o => o.AddPolicy("DevPolicy", builder =>
        {
            builder.WithOrigins(@"*")
                    .SetIsOriginAllowedToAllowWildcardSubdomains().SetIsOriginAllowed(x => true)
                    .AllowAnyMethod()
                    // .
                    .AllowAnyHeader();
        }));

        services
        .AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            options.JsonSerializerOptions.Converters.Add(new DateOnlyJsonConverter());
        });
        services.Configure<AppConfig>(Configuration.GetSection("AppSettings"));
        AmazonDynamoDBConfig clientConfig = new()
        {
            ServiceURL = "http://localhost:8000"
        };

        string region = Environment.GetEnvironmentVariable("AWS_REGION") ?? RegionEndpoint.USWest2.SystemName;
        services
                // .AddSingleton<IAmazonDynamoDB>(new AmazonDynamoDBClient(RegionEndpoint.GetBySystemName(region)))
                .AddSingleton<IAmazonDynamoDB>(new AmazonDynamoDBClient(clientConfig))
                // .AddSingleton<IAmazonDynamoDB>(sp =>
                // {
                //     var clientConfig = new AmazonDynamoDBConfig
                //     {
                //         ServiceURL = "http://localhost:8000"
                //     };
                //     return new AmazonDynamoDBClient(clientConfig);
                // })
                .AddScoped<IDynamoDBContext, DynamoDBContext>()
                .AddAWSService<IAmazonSimpleEmailServiceV2>().AddDefaultAWSOptions(new AWSOptions
                {
                    Region = RegionEndpoint.GetBySystemName(region)
                })
                .AddScoped<IStatementRepository, StatementRepository>()
                .AddScoped<IUnitRepository, DwellUnitRepository>()
                .AddScoped<IS3Service, S3Service>()
                .AddScoped(typeof(IRepository<Condo>), typeof(CondoRepository))
                .AddScoped(typeof(IRepository<DwellUnit>), typeof(GenericRepository<DwellUnit>))
                .AddScoped(typeof(IRepository<Period>), typeof(GenericRepository<Period>))
                .AddScoped(typeof(IRepository<Manager>), typeof(GenericRepository<Manager>))
                .AddScoped(typeof(IRepository<ManagerCondo>), typeof(GenericRepository<ManagerCondo>))
                .AddScoped(typeof(IRepository<UnitAllocation>), typeof(GenericRepository<UnitAllocation>))
                .AddScoped<EmailSenderService>()
                .AddScoped<DataSeeder>()
                .AddScoped<StatementAllocationService>()
                .AddScoped<JwtTokenGenerator>();

        services.AddAWSService<IAmazonCognitoIdentityProvider>();

        services.AddValidatorsFromAssemblyContaining<StatatementValidator>();
        services.AddFluentValidationAutoValidation();

        var userPoolId = Configuration["AppSettings:Cognito:UserPoolId"];
        var clientId = Configuration["AppSettings:Cognito:ClientId"];
        var signingKeys = JwtTokenValidator.GetSigningKeys($"https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/jwks.json");

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                // options.Authority = Configuration["Auth0:Authority"];
                // options.Audience = Configuration["Auth0:Audience"];
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = $"https://cognito-idp.{region}.amazonaws.com/{userPoolId}", // Issuer validation
                    ValidAudience = clientId, // Audience validation
                    IssuerSigningKeyResolver = (token, securityToken, kid, validationParameters) =>  signingKeys                    
                };
            });

        // services.AddAWSService<IAmazonS3>();
        services.AddSingleton<IAmazonS3>(new AmazonS3Client(RegionEndpoint.GetBySystemName(region)));
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        app.UseCors("DevPolicy");

        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        app.UseHttpsRedirection();

        app.UseRouting();

        // Add manager authorization middleware
        app.UseMiddleware<ManagerAuthorizationMiddleware>();

        app.UseAuthentication();
        app.UseAuthorization();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
            endpoints.MapGet("/", async context =>
            {
                await context.Response.WriteAsync("Welcome to running ASP.NET Core on AWS Lambda");
            });
        });
    }
}