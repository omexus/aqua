using System.ComponentModel.DataAnnotations;

namespace aqua.api.Dtos;

public class CreateUnitsRequest
{
    [Required]
    public string Prefix { get; set; } = string.Empty;
    
    [Required]
    public List<UnitRequest> Units { get; set; } = new();
}

public class UnitRequest
{
    [Required]
    public string Unit { get; set; } = string.Empty;
    
    public string? Name { get; set; }
    
    public string? Email { get; set; }
    
    public double? SquareFootage { get; set; }
}
