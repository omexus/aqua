using Microsoft.AspNetCore.Mvc;
using aqua.api.Repositories;
using aqua.api.Dtos;
using UnitDto = aqua.api.Dtos.UnitDto;
using aqua.api.Helpers;
using aqua.api.Entities;

namespace aqua.api.Controllers;

[Route("api/[controller]")]
public class CondosController : ControllerBase
{
    // private readonly IAmazonDynamoDB _dynamoDBClient;

    private readonly ILogger<UnitsController> _logger;
    private readonly IS3Service _s3Service;
    private readonly IRepository<Condo> _unitRepository;

    public CondosController(ILogger<UnitsController> logger, IRepository<Condo> unitRepository, IS3Service s3Service)
    {
        this._unitRepository = unitRepository;
        this._logger = logger;
        this._s3Service = s3Service;
    }

    // GET api/Units
    [HttpGet("{id}")]  
    public async Task<ActionResult<UnitDto>> GetUnit(Guid id)
    {
        _logger.LogDebug("Get Condo by ID {id}", id);
        var condo = await _unitRepository.GetByIdAsync(id);
        
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
