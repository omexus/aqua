using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using aqua.api.Entities;
using Microsoft.AspNetCore.Mvc;
using aqua.api.Repositories;
using Microsoft.Extensions.Logging;

namespace aqua.api.Controllers;

[Route("api/[controller]")]
public class TenantsController : ControllerBase
{
    // private readonly IAmazonDynamoDB _dynamoDBClient;

    private readonly ILogger<StatementsController> logger;
    private readonly IStatementRepository stmtRepository;
    public TenantsController(ILogger<StatementsController> logger, IStatementRepository bookRepository)
    {
        this.logger = logger;
        this.stmtRepository = bookRepository;
    }
    // GET api/statements
    [HttpGet("{id}")]  
    public async Task<ActionResult<IEnumerable<Statement>>> Get(Guid id, [FromQuery] int limit = 10)
    {
        logger.LogDebug($"Get Statements by ID {id} with limit {limit}");
        if (limit <= 0 || limit > 100) return BadRequest("The limit should been between [1-100]");
        return Ok(await stmtRepository.GetStatementsAsync(id, "UserId#"));
    }
    
    [HttpGet("{id}/buildings")]  
    public async Task<ActionResult<IEnumerable<Statement>>> GetTenants(Guid id, [FromQuery] int limit = 10)
    {
        logger.LogDebug($"Get Statements by ID {id} with limit {limit}");
        if (limit <= 0 || limit > 100) return BadRequest("The limit should been between [1-100]");
        return Ok(await stmtRepository.GetBuildingsAsync(id));
    }
    
    // public IEnumerable<string> Get()
    // {
        //
        // if (limit <= 0 || limit > 100) return BadRequest("The limit should been between [1-100]");
        //
        // return Ok(await stmtRepository.GetBuildingsAsync(limit));
        // return new List<string>();
        // var table = Table.LoadTable(_dynamoDBClient, TableName);
        // var scanFilter = new ScanFilter();
        // var search = table.Scan(scanFilter);
        // var documents = await search.GetRemainingAsync();
        // return documents.Select(document => document.ToJson());
        // *******
        // var request = new GetItemRequest
        // {
        //     TableName = _databaseSettings.Value.TableName,
        //     Key = new Dictionary<string, AttributeValue>
        //     {
        //         { "pk", new AttributeValue { S = id.ToString() } },
        //         { "sk", new AttributeValue { S = id.ToString() } }
        //     }
        // };

        // var response = await _dynamoDb.GetItemAsync(request);
        // if (response.Item.Count == 0)
        // {
        //     return null;
        // }

        // var itemAsDocument = Document.FromAttributeMap(response.Item);
        // return JsonSerializer.Deserialize<CustomerDto>(itemAsDocument.ToJson());
    // }


    // // GET api/statements/5
    // [HttpGet("{id}")]
    // public string Get(int id)
    // {
    //     return "value";
    // }

    // public string Get

    // POST api/statements
    [HttpPost]
    public void Post([FromBody] string value)
    {
    }

    // PUT api/values/5
    [HttpPut("{id}")]
    public void Put(int id, [FromBody] string value)
    {
    }

    // DELETE api/values/5
    [HttpDelete("{id}")]
    public void Delete(int id)
    {
    }
}
