using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using aqua.api;

namespace aqua.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DataController : ControllerBase
    {
        private readonly DataSeeder _dataSeeder;

        public DataController(DataSeeder dataSeeder)
        {
            _dataSeeder = dataSeeder;
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
