using Microsoft.AspNetCore.Mvc;
using aqua.api.Repositories;
using aqua.api.Dtos;
using UnitDto = aqua.api.Dtos.UnitDto;
using aqua.api.Helpers;
using aqua.api.Entities;

namespace aqua.api.Controllers;

[Route("api/[controller]")]
public class UnitsController : ControllerBase
{
    // private readonly IAmazonDynamoDB _dynamoDBClient;

    private readonly ILogger<UnitsController> _logger;
    private readonly IUnitRepository _unitRepository;
    private readonly IS3Service _s3Service;

    public UnitsController(ILogger<UnitsController> logger, IUnitRepository unitRepository, IS3Service s3Service)
    {
        this._logger = logger;
        this._unitRepository = unitRepository;
        this._s3Service = s3Service;
    }
    // GET api/Units
    [HttpGet("{id}/{unitId}")]  
    public async Task<ActionResult<UnitDto>> GetUnit(Guid id, string unitId)
    {
        _logger.LogDebug("Get Unit by ID {UnitId}", unitId);
        var unit = await _unitRepository.GetByIdAsync(id, $"UNIT#{unitId}");

        return Ok(UnitMapper.UnitToDto(unit));
    }
    
    [HttpGet("{id}")]  
    public async Task<ActionResult<IEnumerable<UnitDto>>> GetUnits(Guid id)
    {
        _logger.LogDebug("Get Units by ID {id}", id);
        var stmts = await _unitRepository.GetListAsync(id, "UID#");

        return Ok(UnitMapper.UnitsToDto(stmts));
    }

    [HttpPost("{id}/bulk")]
    public async Task<ActionResult<IEnumerable<UnitDto>>> CreateUnits(Guid id, [FromBody] CreateUnitsRequest request)
    {
        _logger.LogDebug("Create {Count} units for condo {CondoId}", request.Units.Count, id);
        
        if (request.Units.Count > 10)
        {
            return BadRequest("Cannot create more than 10 units at once");
        }

        var createdUnits = new List<UnitDto>();
        
        foreach (var unitRequest in request.Units)
        {
            var unit = new DwellUnit
            {
                Id = id,
                Attribute = $"UID#{unitRequest.Unit}",
                UserId = Guid.NewGuid().ToString(),
                Prefix = request.Prefix,
                Name = unitRequest.Name,
                Email = unitRequest.Email,
                Unit = unitRequest.Unit,
                Role = "TENANT",
                SquareFootage = unitRequest.SquareFootage
            };

            var success = await _unitRepository.CreateAsync(id, unit, "UID#");
            if (success)
            {
                createdUnits.Add(UnitMapper.UnitToDto(unit));
            }
        }

        return Ok(createdUnits);
    }

    //  [HttpGet("{id}/{period}")]  
    // public async Task<ActionResult<IEnumerable<UnitFileDto>>> Get(Guid id, string period, [FromQuery] int limit = 10)
    // {
    //     _logger.LogDebug("Get Units by ID {id} with limit {limit}", id, limit);
    //     if (limit <= 0 || limit > 100) return BadRequest("The limit should been between [1-100]");
    //     var stmts = await _stmtRepository.GetUnitsAsync(id, $"STMT#PER#{period}");
    //     return Ok(UnitMapper.UnitFilesToDto(stmts));
    // }

    // [HttpGet("{id}/presign/{fileName}")]  
    // public async Task<ActionResult<IEnumerable<Dtos.UnitDto>>> Get(Guid id, string fileName)
    // {
    //     return Ok(await _s3Service.GetPresignedUrlAsync(id, "some", fileName));
    // }
    
    
    // [HttpGet("{id}/buildings")]  
    // public async Task<ActionResult<IEnumerable<Dtos.UnitDto>>> GetBuildings(Guid id, [FromQuery] int limit = 10)
    // {
    //     _logger.LogDebug($"Get Units by ID {id} with limit {limit}");
    //     if (limit <= 0 || limit > 100) return BadRequest("The limit should been between [1-100]");
    //     return Ok(await _stmtRepository.GetBuildingsAsync(id));
    // }
    
    // [HttpGet("{id}/upload")]  
    // public async Task<ActionResult<IEnumerable<Dtos.UnitDto>>> Upload(Guid id, [FromQuery] int limit = 10)
    // {
    //     _logger.LogDebug($"Get Units by ID {id} with limit {limit}");
    //     if (limit <= 0 || limit > 100) return BadRequest("The limit should been between [1-100]");
    //     return Ok(await _stmtRepository.GetBuildingsAsync(id));
    // }
    
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


    // // GET api/Units/5
    // [HttpGet("{id}")]
    // public string Get(int id)
    // {
    //     return "value";
    // }

    // public string Get

    // // POST api/Units
    // [HttpPost("{id}")]
    // public async Task<ActionResult<Dtos.UnitDto>> Post([FromBody] Dtos.UnitDto Unit, Guid id)
    // {
    //     var stmt = new Entities.Unit
    //     {
    //         Id = id,
    //         // Attribute =  $"Unit#{Unit.UnitDate?.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)}"
    //         // UnitDate = Unit.UnitDate,
    //         // Amount = Unit.Amount,
    //         // Description = Unit.Description
    //     };
        
    //     var result = await _stmtRepository.CreateAsync(id, stmt, "Unit#");

    //     if (result)
    //     {
    //         return CreatedAtAction(
    //             nameof(Get),
    //             new { id = id},
    //             Unit);
    //     }
    //     else
    //     {
    //         return BadRequest("Fail to persist");
    //     }

    // }

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
