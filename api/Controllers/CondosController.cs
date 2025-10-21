using Microsoft.AspNetCore.Mvc;
using aqua.api.Repositories;
using aqua.api.Dtos;
using UnitDto = aqua.api.Dtos.UnitDto;
using aqua.api.Helpers;
using aqua.api.Entities;
using Amazon.DynamoDBv2.DataModel;

namespace aqua.api.Controllers;

[Route("api/[controller]")]
public class CondosController : ControllerBase
{
    // private readonly IAmazonDynamoDB _dynamoDBClient;

    private readonly ILogger<UnitsController> _logger;
    private readonly IS3Service _s3Service;
    private readonly IRepository<Condo> _condoRepository;
    private readonly IRepository<DwellUnit> _unitRepository;
    private readonly IDynamoDBContext _context;

    public CondosController(
        ILogger<UnitsController> logger, 
        IRepository<Condo> condoRepository, 
        IRepository<DwellUnit> unitRepository,
        IDynamoDBContext context,
        IS3Service s3Service)
    {
        this._condoRepository = condoRepository;
        this._unitRepository = unitRepository;
        this._context = context;
        this._logger = logger;
        this._s3Service = s3Service;
    }

    // POST api/condos
    [HttpPost]
    public async Task<ActionResult<CondoCreateResponse>> CreateCondo([FromBody] CondoCreateRequest request)
    {
        try
        {
            _logger.LogInformation("Creating condo: {Name} with {NumberOfUnits} units", request.Name, request.NumberOfUnits);

            // Create the condo
            var condo = new Condo
            {
                Id = Guid.NewGuid(),
                Attribute = "CONDO",
                Name = request.Name,
                Prefix = request.Prefix
            };

            await _context.SaveAsync(condo);

            // Create units for the condo
            var units = new List<DwellUnit>();
            for (int i = 1; i <= request.NumberOfUnits; i++)
            {
                var unit = new DwellUnit
                {
                    Id = Guid.NewGuid(),
                    Attribute = $"UNIT#{condo.Id}",
                    Unit = i.ToString(),
                    Prefix = condo.Prefix ?? "",
                    UserId = "", // Will be assigned when user is provisioned
                    Name = "", // Will be assigned when user is provisioned
                    Email = "", // Will be assigned when user is provisioned
                    Role = "" // Will be assigned when user is provisioned
                };
                units.Add(unit);
            }

            // Save all units
            foreach (var unit in units)
            {
                await _context.SaveAsync(unit);
            }

            var condoDto = new aqua.api.Dtos.CondoDto
            {
                Id = condo.Id.ToString(),
                Name = condo.Name ?? "",
                Prefix = condo.Prefix ?? ""
            };

            _logger.LogInformation("Condo created successfully: {CondoId} with {UnitCount} units", condo.Id, units.Count);

            return Ok(new CondoCreateResponse
            {
                Success = true,
                Condo = condoDto
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating condo: {Name}", request.Name);
            return StatusCode(500, new CondoCreateResponse
            {
                Success = false,
                Error = "Internal server error"
            });
        }
    }

    // GET api/Units
    [HttpGet("{id}")]  
    public async Task<ActionResult<UnitDto>> GetUnit(Guid id)
    {
        _logger.LogDebug("Get Condo by ID {id}", id);
        var condo = await _condoRepository.GetByIdAsync(id, "CONDO");
        
        if (condo == null) return NotFound();

        return Ok(CondoMapper.CondoToDto(condo));
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
