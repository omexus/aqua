using System;

namespace aqua.api.Dtos;

// <summary>
public class PeriodSaveRequestDto
{
    public required string Period { get; set; }
    // public required string Unit { get; set; }
    public double Amount { get; set; } = 0.0;
    public string? Prefix { get; set; }
    public int? Generated { get; set; } = 0;
    public string? From { get; set; }
    public string? To { get; set;}
}
