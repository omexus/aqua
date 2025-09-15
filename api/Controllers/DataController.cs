using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using aqua.api;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;

namespace aqua.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DataController : ControllerBase
    {
        private readonly DataSeeder _dataSeeder;
        private readonly IAmazonDynamoDB _dynamoDBClient;

        public DataController(DataSeeder dataSeeder, IAmazonDynamoDB dynamoDBClient)
        {
            _dataSeeder = dataSeeder;
            _dynamoDBClient = dynamoDBClient;
        }

        [HttpPost("create-table")]
        public async Task<IActionResult> CreateTable()
        {
            try
            {
                var tableName = "Statements";
                
                // Check if table already exists
                try
                {
                    var describeResponse = await _dynamoDBClient.DescribeTableAsync(tableName);
                    return Ok(new { message = "Table already exists", tableName = tableName });
                }
                catch (ResourceNotFoundException)
                {
                    // Table doesn't exist, create it
                }

                var createTableRequest = new CreateTableRequest
                {
                    TableName = tableName,
                    KeySchema = new List<KeySchemaElement>
                    {
                        new KeySchemaElement("Id", KeyType.HASH), // Partition key
                        new KeySchemaElement("Attribute", KeyType.RANGE) // Sort key
                    },
                    AttributeDefinitions = new List<AttributeDefinition>
                    {
                        new AttributeDefinition("Id", ScalarAttributeType.S),
                        new AttributeDefinition("Attribute", ScalarAttributeType.S)
                    },
                    BillingMode = BillingMode.PAY_PER_REQUEST
                };

                await _dynamoDBClient.CreateTableAsync(createTableRequest);
                
                // Wait for table to be active (simple polling)
                var maxWaitTime = TimeSpan.FromSeconds(30);
                var startTime = DateTime.UtcNow;
                
                while (DateTime.UtcNow - startTime < maxWaitTime)
                {
                    try
                    {
                        var describeResponse = await _dynamoDBClient.DescribeTableAsync(tableName);
                        if (describeResponse.Table.TableStatus == TableStatus.ACTIVE)
                        {
                            break;
                        }
                    }
                    catch (ResourceNotFoundException)
                    {
                        // Table still being created
                    }
                    
                    await Task.Delay(1000); // Wait 1 second before checking again
                }
                
                return Ok(new { message = "Table created successfully!", tableName = tableName });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("seed")]
        public async Task<IActionResult> SeedData()
        {
            try
            {
                await _dataSeeder.SeedDataAsync();
                return Ok(new { message = "Data seeded successfully!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("health")]
        public IActionResult Health()
        {
            return Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
        }
    }
}
