using Microsoft.AspNetCore.Mvc;
using aqua.api.Repositories;
using aqua.api.Dtos;
using aqua.api.Helpers;
using aqua.api.Entities;

namespace aqua.api.Controllers;

[Route("api/[controller]")]
public class StatementsController(ILogger<StatementsController> logger, IStatementRepository bookRepository, IUnitRepository unitRepository, IRepository<Condo> condoRepository, IS3Service s3Service, IRepository<Period> periodRepository) : ControllerBase
{
    private readonly ILogger<StatementsController> _logger = logger;
    private readonly IStatementRepository _stmtRepository = bookRepository;
    private readonly IUnitRepository unitRepository = unitRepository;
    private readonly IRepository<Condo> condoRepository = condoRepository;
    private readonly IS3Service _s3Service = s3Service;
    private readonly IRepository<Period> periodRepository = periodRepository;

    // GET api/statements
    [HttpGet("{id}")]  
    public async Task<ActionResult<IEnumerable<PeriodDto>>> GetPeriods(Guid id, [FromQuery] int limit = 10)
    {
        _logger.LogDebug("Get Statements by ID {id} with limit {limit}", id, limit);
        if (limit <= 0 || limit > 100) return BadRequest("The limit should been between [1-100]");
        var periods = await periodRepository.GetListAsync(id, "PER#");

        if (periods == null){
            return BadRequest($"Could not find periods for Id: {id}");
        }

        return Ok(
            periods.Select(period => new PeriodDto
            {
                Id = period.Attribute,
                From = period.From,
                To = period.To,
                Prefix = period.Prefix,
                Generated = period.Generated,
                Amount = period.Amount,
            })
        );
    }
    
     [HttpGet("{id}/{periodId}")] 
    public async Task<ActionResult<PeriodDto>> GetPeriod(Guid id, string periodId, [FromQuery] int limit = 10)
    {
        _logger.LogDebug("Get Statements by ID {id} with limit {limit}", id, limit);
        if (limit <= 0 || limit > 100) return BadRequest("The limit should been between [1-100]");
        var period = await periodRepository.GetByIdAsync(id, $"PER#{periodId}");
        if (period == null){
            return BadRequest("Could not find period");
        }
        return Ok(new PeriodDto
        {
            Id = periodId,
            From = period.From,
            To = period.To,
            Prefix = period.Prefix,
            Generated = period.Generated,
            Amount = period.Amount,
        });
    }

    [HttpGet("{id}/{period}/files")]  
    public async Task<ActionResult<IEnumerable<StatementDto>>> GetFiles(Guid id, string period, [FromQuery] int limit = 10)
    {
        _logger.LogDebug("Get Statements by ID {id} with limit {limit}", id, limit);
        if (limit <= 0 || limit > 100) return BadRequest("The limit should been between [1-100]");
        var stmts = await _stmtRepository.GetStatementsAsync(id, $"STMT#PER#{period}");
        return Ok(StatementMapper.StatementFilesToDto(stmts));
    }

    [HttpGet("{id}/presign/{period}/{fileName}")]  
    public async Task<ActionResult<IEnumerable<Dtos.StatementDto>>> Get(Guid id, string fileName, string period)
    {
        return Ok(await _s3Service.GetPresignedUrlAsync(id, period, fileName));
    }
    
    
    [HttpGet("{id}/buildings")]  
    public async Task<ActionResult<IEnumerable<Dtos.StatementDto>>> GetBuildings(Guid id, [FromQuery] int limit = 10)
    {
        _logger.LogDebug($"Get Statements by ID {id} with limit {limit}");
        if (limit <= 0 || limit > 100) return BadRequest("The limit should been between [1-100]");
        return Ok(await _stmtRepository.GetBuildingsAsync(id));
    }
    
    [HttpGet("{id}/upload")]  
    public async Task<ActionResult<IEnumerable<Dtos.StatementDto>>> Upload(Guid id, [FromQuery] int limit = 10)
    {
        _logger.LogDebug($"Get Statements by ID {id} with limit {limit}");
        if (limit <= 0 || limit > 100) return BadRequest("The limit should been between [1-100]");
        return Ok(await _stmtRepository.GetBuildingsAsync(id));
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
    [HttpPost("{id}")]
    public async Task<ActionResult<Dtos.StatementDto>> Post([FromBody] Dtos.StatementSaveRequestDto statement, Guid id)
    {
        //get unit to grab prefix
        var unit = await unitRepository.GetByIdAsync(id, $"UNIT#{statement.Unit}");
        if (unit == null){
            return BadRequest("Could not find unit");
        }

        var condo = await condoRepository.GetByIdAsync(id);
        if (condo == null){
            return BadRequest("Could not find condo");
        }
        // //convert period (string) in yyyyMMdd format to date the;       
        var prefix = $"{condo.Prefix}/{statement.Period}";

        //set entity
        var stmt = new Entities.Statement
        {
            Id = id,
            Attribute =  $"STMT#PER#{statement.Period}#{statement.fileName}",
            Amount = statement.Amount,
            Prefix = prefix,
            UserId = unit.UserId,
            Unit = unit.Unit,
            Name = unit.Name,
            Email = unit.Email,
        };
        
        var result = await _stmtRepository.CreateAsync(id, stmt, "STMT#");

        if (result)
        {
            return CreatedAtAction(
                nameof(GetPeriod),
                new { id, periodId = statement.Period},
                statement);
        }
        else
        {
            return BadRequest("Fail to persist");
        }

    }

    // PUT api/values/5
    [HttpPut("{id}")]
    public void Put(int id, [FromBody] string value)
    {
    }

    // DELETE api/statements/
    [HttpDelete("{id}/{period}/{fileName}")]
    public async Task<ActionResult> Delete(Guid id, string period, string fileName)
    {
        await _s3Service.DeleteFileAsync("aqua-stmts", $"{id}/{period}/{fileName}");

        await _stmtRepository.DeleteAsync(id, $"STMT#PER#{period}#{fileName}");

        return Ok();        
    }

    
    /// <summary>
    /// Delete all statements for a period
    /// </summary>
    /// <param name="id"></param>
    /// <param name="period"></param>
    /// <param name="fileName"></param>
    /// <returns></returns>
    [HttpDelete("{id}/{period}")]
    public async Task<ActionResult> DeleteAllStatements(Guid id, string period)
    {
        await _s3Service.DeleteAllFilesAsync("aqua-stmts", $"{id}/{period}");

        await _stmtRepository.DeleteAsync(id, $"STMT#PER#{period}");

        return Ok();        
    }
}
