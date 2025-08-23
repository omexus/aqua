using Microsoft.AspNetCore.Mvc;
using aqua.api.Repositories;
using aqua.api.Dtos;
using aqua.api.Entities;
namespace aqua.api.Controllers;
using System;
using System.Globalization;

[Route("api/[controller]")]
public class PeriodsController(
    ILogger<StatementsController> logger, 
    IStatementRepository bookRepository, 
    IUnitRepository unitRepository, 
    IRepository<Condo> condoRepository, 
    IS3Service s3Service, 
    IRepository<Period> periodRepository,
    EmailSenderService emailSenderService) : ControllerBase
{
    private readonly ILogger<StatementsController> _logger = logger;
    private readonly IStatementRepository _stmtRepository = bookRepository;
    private readonly IUnitRepository unitRepository = unitRepository;
    private readonly IRepository<Condo> condoRepository = condoRepository;
    private readonly IS3Service _s3Service = s3Service;
    private readonly IRepository<Period> periodRepository = periodRepository;
    private readonly EmailSenderService emailSenderService = emailSenderService;

    // GET api/periods
    [HttpGet("{id}")]
    public async Task<ActionResult<IEnumerable<PeriodDto>>> GetPeriods(Guid id, [FromQuery] int limit = 10)
    {
        _logger.LogDebug("Get Statements by ID {id} with limit {limit}", id, limit);
        if (limit <= 0 || limit > 100) return BadRequest("The limit should been between [1-100]");
        var periods = await periodRepository.GetListAsync(id, "PER#");

        if (periods == null)
        {
            return BadRequest($"Could not find periods for Id: {id}");
        }

        return Ok(
            periods.Select(period => new PeriodDto
            {
                Id = period.ToId(1),
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
        if (period == null)
        {
            return BadRequest("Could not find period");
        }
        return Ok(new PeriodDto
        {
            Id = period.Attribute,
            From = period.From,
            To = period.To,
            Prefix = period.Prefix,
            Generated = period.Generated,
            Amount = period.Amount,
        });
    }

    // [HttpGet("{id}/{periodId}/statements")]  
    // public async Task<ActionResult<IEnumerable<StatementDto>>> GetStatements(Guid id, string periodId, [FromQuery] int limit = 10)
    // {
    //     _logger.LogDebug("Get Statements by ID {id} with limit {limit}", id, limit);
    //     if (limit <= 0 || limit > 100) return BadRequest("The limit should been between [1-100]");
    //     var stmts = await _stmtRepository.GetStatementsAsync(id, $"STMT#PER#{periodId}");
    //     if (stmts == null){
    //         return BadRequest("Could not find statements");
    //     }
    //     return Ok(StatementMapper.StatementFilesToDto(stmts));
    // }

    [HttpGet("{id}/{periodId}/statements")]
    public async Task<ActionResult<PeriodWithStatemendDto>> GetPeriodStatements(Guid id, string periodId, [FromQuery] int limit = 10)
    {
        _logger.LogDebug("Get Statements by ID {id} with limit {limit}", id, limit);
        if (limit <= 0 || limit > 100) return BadRequest("The limit should been between [1-100]");

        //get period
        var period = await periodRepository.GetByIdAsync(id, $"PER#{periodId}");
        if (period == null)
        {
            return BadRequest("Could not find period");
        }

        var stmts = await _stmtRepository.GetStatementsAsync(id, $"STMT#PER#{periodId}");
        if (stmts == null)
        {
            return BadRequest("Could not find statements");
        }
        return Ok(new PeriodWithStatemendDto
        {
            Period = new PeriodDto
            {
                Id = period.ToId(),
                From = period.From,
                To = period.To,
                Prefix = period.Prefix,
                Generated = period.Generated,
                Amount = period.Amount,
            },
            Statements = stmts.Select(stmt => new StatementFileDto
            {
                Id = stmt.ToId(),
                FileName = stmt.ToId(3),
                Prefix = stmt.Prefix,
                Unit = stmt.Unit,
                Name = stmt.Name,
                // Role = stmt.Role,
                Email = stmt.Email,
                Amount = stmt.Amount,
            }).ToList()
        });
    }

    [HttpPost("{id}")]
    public async Task<ActionResult<Dtos.PeriodDto>> AddPeriod([FromBody] Dtos.PeriodSaveRequestDto period, Guid id)
    {
        //get unit to grab prefix
        // var unit = await unitRepository.GetByIdAsync(id, $"UNIT#{period.Unit}");
        // if (unit == null){
        //     return BadRequest("Could not find unit");
        // }

        var condo = await condoRepository.GetByIdAsync(id);
        if (condo == null)
        {
            return BadRequest("Could not find condo");
        }
        // //convert period (string) in yyyyMMdd format to date the;       
        var prefix = $"{condo.Prefix}/{period.Period}";

        //set entity
        var periodDb = new Entities.Period
        {
            Id = id,
            Attribute = $"PER#{period.Period}",
            Amount = period.Amount,
            Prefix = prefix,
            From = period.From,
            To = period.To,
            Generated = period.Generated.GetValueOrDefault(0),
        };

        var result = await periodRepository.CreateAsync(id, periodDb, null);

        if (result)
        {
            // return Ok();

            return CreatedAtAction(
                nameof(GetPeriod),
                new { id, periodId = period.Period },
                new PeriodDto
                {
                    Id = periodDb.ToId(1),
                    From = periodDb.From,
                    To = periodDb.To,
                    Prefix = periodDb.Prefix,
                    Generated = periodDb.Generated,
                    Amount = periodDb.Amount,
                });
        }
        else
        {
            return BadRequest("Fail to persist");
        }

    }

    [HttpPost("{id}/send/{periodId}")]
    public async Task<ActionResult> SendEmail(Guid id, string periodId, [FromBody] string[] files)
    {

        var stmts = await _stmtRepository.GetStatementsAsync(id, $"STMT#PER#{periodId}");
        if (stmts == null || stmts.Count == 0)
        {
            return BadRequest("Could not find statements");
        }

        foreach (var stmt in stmts)
        {
            if (files.Length > 0 && !files.Contains(stmt.Attribute))
            {
                continue;
            }

            if (string.IsNullOrEmpty(stmt.Email))
            {
                _logger.LogWarning("Email is empty for {unit}, skipping", stmt.Unit);
                continue;
            }

            if (string.IsNullOrEmpty(stmt.Name))
            {
                _logger.LogWarning("Name is empty for {unit}, skipping", stmt.Unit);
                continue;
            }

            if (string.IsNullOrEmpty(stmt.Email))
            {
                _logger.LogWarning("Email is empty for {unit}, skipping", stmt.Unit);
                continue;
            }

            var fileName = stmt.ToId(3);
            var period = stmt.ToId(2);

            //convert period (string) in yyyyMMdd format to full month name and year with spanish locale
            var periodDate = DateTime.ParseExact(period, "yyyyMMdd", CultureInfo.InvariantCulture).ToString("MMMM 'del' yyyy", new CultureInfo("es-ES"));

            await emailSenderService.SendEmailWithS3AttachmentAsync(("Administrador", "admin@myezbiz.com"), (stmt.Name, stmt.Email), $"Recibo del mes de {periodDate}", $"Estimado/a {stmt.Name}, te enviamos tu estado de cuenta de agua para el mes de {periodDate}", "aqua-stmts", $"{stmt.Id}/{periodId}/{fileName}");
        }
        return Ok();
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
