namespace aqua.api.Dtos;

// <summary>
public class CondoDto
{
    public required string Id { get; set; }    
    public required string Name { get; set; }
    public required string Prefix { get; set; }
}

public class CondoCreateRequest
{
    public required string Name { get; set; }
    public required string Prefix { get; set; }
    public int NumberOfUnits { get; set; }
}

public class CondoCreateResponse
{
    public bool Success { get; set; }
    public CondoDto? Condo { get; set; }
    public string? Error { get; set; }
}
