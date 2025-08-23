using System;

namespace aqua.api.Dtos;

// <summary>
public class StatementSaveRequestDto
{
    public required string Period { get; set; }
    public double Amount { get; set; } = 0.0;
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Unit { get; set; }
    public string? fileName { get; set; }
}
